from starlette.routing import Route
from starlette.responses import JSONResponse
from app.database import get_db_connection
from app.services.ml_service import predict_spam, train_feedback

async def health_check(request):
    return JSONResponse({"status": "ok"})

async def predict(request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"detail": "Invalid JSON"}, status_code=400)
        
    text = data.get("text", "")
    if not text.strip():
        return JSONResponse({"detail": "Text cannot be empty"}, status_code=400)
    
    result = predict_spam(text)
    return JSONResponse(result)

async def submit_feedback(request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"detail": "Invalid JSON"}, status_code=400)
        
    conn = get_db_connection()
    try:
        text = data.get("text", "")
        predicted_label = data.get("predicted_label", "")
        predicted_score = float(data.get("predicted_score", 0.0))
        user_corrected_label = data.get("user_corrected_label", "")
        is_spam = bool(data.get("is_spam", False))
        
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO feedback (text, predicted_label, predicted_score, user_corrected_label, is_spam)
            VALUES (?, ?, ?, ?, ?)
        ''', (text, predicted_label, predicted_score, user_corrected_label, is_spam))
        conn.commit()
        
        feedback_id = cursor.lastrowid
        
        # Continuous learning
        train_feedback(text, user_corrected_label)
        
        return JSONResponse({
            "id": feedback_id,
            "text": text,
            "predicted_label": predicted_label,
            "predicted_score": predicted_score,
            "user_corrected_label": user_corrected_label,
            "is_spam": is_spam
        })
    except Exception as e:
        return JSONResponse({"detail": str(e)}, status_code=500)
    finally:
        conn.close()

routes = [
    Route("/api/v1/health", health_check, methods=["GET"]),
    Route("/api/v1/predict", predict, methods=["POST"]),
    Route("/api/v1/feedback", submit_feedback, methods=["POST"])
]

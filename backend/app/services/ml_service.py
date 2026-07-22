import math
from collections import defaultdict
import re

class NaiveBayesClassifier:
    def __init__(self):
        self.word_counts = {'spam': defaultdict(int), 'ham': defaultdict(int)}
        self.class_counts = {'spam': 0, 'ham': 0}
        self.vocab = set()
        
    def _tokenize(self, text):
        """Simple tokenizer: lowercase and split by non-alphanumeric"""
        return re.findall(r'\b\w+\b', text.lower())
        
    def train(self, text, label):
        """Train the model with a single text and its label ('spam' or 'ham')"""
        words = self._tokenize(text)
        self.class_counts[label] += 1
        for word in words:
            self.word_counts[label][word] += 1
            self.vocab.add(word)
            
    def predict_proba(self, text):
        """Predict the probability of the text being spam"""
        words = self._tokenize(text)
        
        # Calculate log probabilities to prevent underflow
        # Prior probabilities
        total_docs = sum(self.class_counts.values())
        if total_docs == 0:
            return {'spam': 0.0, 'ham': 1.0}
            
        log_prob_spam = math.log((self.class_counts['spam'] + 1) / (total_docs + 2))
        log_prob_ham = math.log((self.class_counts['ham'] + 1) / (total_docs + 2))
        
        vocab_size = len(self.vocab)
        total_spam_words = sum(self.word_counts['spam'].values())
        total_ham_words = sum(self.word_counts['ham'].values())
        
        for word in words:
            # Laplace smoothing (add 1)
            spam_word_prob = (self.word_counts['spam'][word] + 1) / (total_spam_words + vocab_size)
            ham_word_prob = (self.word_counts['ham'][word] + 1) / (total_ham_words + vocab_size)
            
            log_prob_spam += math.log(spam_word_prob)
            log_prob_ham += math.log(ham_word_prob)
            
        # Convert log probabilities back to normal probabilities
        # Normalize by subtracting the max to prevent overflow in exp
        max_log_prob = max(log_prob_spam, log_prob_ham)
        prob_spam = math.exp(log_prob_spam - max_log_prob)
        prob_ham = math.exp(log_prob_ham - max_log_prob)
        
        normalized_spam = prob_spam / (prob_spam + prob_ham)
        return normalized_spam

# Initialize a global instance
classifier = NaiveBayesClassifier()

def get_classifier():
    return classifier

# Seed the classifier with some basic industry-standard heuristics/examples
def _seed_classifier():
    seed_data = [
        # Spam examples
        ("Congratulations! You've won a $1,000 Walmart gift card. Click here to claim now.", "spam"),
        ("URGENT: Your account has been suspended. Please log in immediately to verify your identity.", "spam"),
        ("Get cheap meds online! Viagra, Cialis, no prescription needed. Buy now.", "spam"),
        ("You have a pending package delivery. Track your shipment here: http://bit.ly/spam", "spam"),
        ("Make $5000 a week working from home! Guaranteed income.", "spam"),
        ("Meet local singles in your area tonight. Click for pics.", "spam"),
        ("Exclusive offer just for you! Buy one get one free. Limited time only.", "spam"),
        ("Your credit score has dropped. Find out why for free.", "spam"),
        ("Claim your inheritance from a distant relative. Send $500 processing fee.", "spam"),
        ("Lose 10 pounds in a week with this miracle pill! Doctors hate it.", "spam"),
        
        # Ham (Clean) examples
        ("Hey, are we still on for lunch tomorrow at 12:30?", "ham"),
        ("Attached is the Q3 financial report. Please review it before the meeting.", "ham"),
        ("Can you pick up some milk on your way home?", "ham"),
        ("The project deadline has been extended to next Friday.", "ham"),
        ("I'll call you back in 5 minutes, I'm in a meeting.", "ham"),
        ("Happy birthday! Hope you have a wonderful day.", "ham"),
        ("Your flight confirmation for tomorrow is attached.", "ham"),
        ("Thanks for the update. I'll take a look and get back to you.", "ham"),
        ("Did you see the game last night? Crazy finish!", "ham"),
        ("Please find the invoice for the consulting services rendered last month.", "ham")
    ]
    
    for text, label in seed_data:
        classifier.train(text, label)
        
    print("Pure Python Naive Bayes model initialized and seeded.")

# Run seeding on module import
_seed_classifier()

def predict_spam(text: str):
    try:
        clf = get_classifier()
        spam_prob = clf.predict_proba(text)
        
        # Threshold at 0.5
        is_spam = spam_prob > 0.5
        label = "spam" if is_spam else "ham"
        
        return {
            "label": label,
            "score": spam_prob,
            "is_spam": is_spam
        }
    except Exception as e:
        print(f"Error during prediction: {e}")
        return {
            "label": "unknown",
            "score": 0.0,
            "is_spam": False
        }

def train_feedback(text: str, label: str):
    """Dynamically update the model with user feedback"""
    clf = get_classifier()
    # Normalize label just in case
    if label.lower() in ['spam', 'ham']:
        clf.train(text, label.lower())
        print(f"Model retrained with new {label} example.")

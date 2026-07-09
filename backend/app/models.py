from . import db
import bcrypt
import datetime
import uuid

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    is_verified = db.Column(db.Boolean, default=False)
    otp_code = db.Column(db.String(6), nullable=True)
    otp_expires = db.Column(db.DateTime, nullable=True)

    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def is_otp_valid(self, code):
        return self.otp_code == code and self.otp_expires > datetime.datetime.utcnow()


class FuneralService(db.Model):
    __tablename__ = "funeral_services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=False)


class Tribute(db.Model):
    __tablename__ = "tributes"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    message = db.Column(db.Text, nullable=False)
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "message": self.message,
            "user_id": self.user_id
        }


class FuneralProvision(db.Model):
    __tablename__ = "funeral_provisions"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    category = db.Column(db.String(50)) # e.g., 'Wreath', 'Casket', 'Tent'
    price = db.Column(db.Float, default=0.0) # Added for the shopping cart logic
    image_url = db.Column(db.String(255)) 

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "price": self.price,
            "image_url": self.image_url
        }

# --- NEW: EULOGY MODEL ---
class Eulogy(db.Model):
    __tablename__ = "eulogies"

    # Using a secure UUID as the primary key instead of standard IDs
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Basic Information
    deceased_name = db.Column(db.String(150), nullable=False)
    birth_year = db.Column(db.String(4), nullable=True)
    passing_year = db.Column(db.String(4), nullable=True)
    occupation = db.Column(db.String(150), nullable=True)
    interests = db.Column(db.String(255), nullable=True)
    
    # Who They Were
    personality = db.Column(db.Text, nullable=False)
    
    # Link to the user who created it
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "deceased_name": self.deceased_name,
            "birth_year": self.birth_year,
            "passing_year": self.passing_year,
            "occupation": self.occupation,
            "interests": self.interests,
            "personality": self.personality,
            "created_at": self.created_at.isoformat()
        }


# --- Consultation model to persist contact requests ---
class Consultation(db.Model):
    __tablename__ = "consultations"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), nullable=False)
    phone = db.Column(db.String(50), nullable=False)
    questions = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "questions": self.questions,
            "created_at": self.created_at.isoformat()
        }
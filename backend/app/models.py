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

    # Added admin flag for the dashboard
    is_admin = db.Column(db.Boolean, default=False)

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


# ==========================================
# --- ENTERPRISE CATALOG SUITE ---
# ==========================================

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False, default=0.0)
    
    # NEW: Dynamic discount tag controlled by admin
    discount_percent = db.Column(db.Integer, nullable=True, default=0)
    
    dispatch_location = db.Column(db.String(100), default="Nairobi Central")
    
    images = db.relationship('ProductImage', backref='product', lazy=True, cascade="all, delete-orphan")
    specifications = db.relationship('ProductSpecification', backref='product', lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship('ProductReview', backref='product', lazy=True, cascade="all, delete-orphan")

    def get_average_rating(self):
        if not self.reviews:
            return 0.0
        total_prod = sum([review.product_rating for review in self.reviews])
        total_serv = sum([review.service_rating for review in self.reviews])
        return round((total_prod + total_serv) / (len(self.reviews) * 2), 1)
        
    def get_product_rating(self):
        if not self.reviews: return 0.0
        return round(sum([r.product_rating for r in self.reviews]) / len(self.reviews), 1)

    def get_service_rating(self):
        if not self.reviews: return 0.0
        return round(sum([r.service_rating for r in self.reviews]) / len(self.reviews), 1)

    def get_review_count(self):
        return len(self.reviews)

    def to_dict(self):
        return {
            "id": self.id,
            "categoryId": self.category_id,
            "title": self.title,
            "desc": self.description,
            "price": self.price,
            "discount_percent": self.discount_percent,
            "dispatch_location": self.dispatch_location,
            "average_rating": self.get_average_rating(),
            "product_rating": self.get_product_rating(),
            "service_rating": self.get_service_rating(),
            "review_count": self.get_review_count(),
            "images": [img.image_url for img in self.images],
            "specifications": [spec.to_dict() for spec in self.specifications],
            "reviews": [rev.to_dict() for rev in self.reviews]
        }

class ProductImage(db.Model):
    __tablename__ = "product_images"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)

class ProductSpecification(db.Model):
    __tablename__ = "product_specifications"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    key_name = db.Column(db.String(100), nullable=False)
    value = db.Column(db.String(255), nullable=False)
    
    def to_dict(self):
        return {"key": self.key_name, "value": self.value}

class ProductReview(db.Model):
    __tablename__ = "product_reviews"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    product_rating = db.Column(db.Integer, nullable=False, default=5)
    service_rating = db.Column(db.Integer, nullable=False, default=5)
    comment = db.Column(db.Text, nullable=True)
    
    # Photo Upload Support & Verification Lock
    image_url = db.Column(db.String(255), nullable=True) 
    is_verified_buyer = db.Column(db.Boolean, default=True)
    
    # Admin Reply Data
    admin_reply = db.Column(db.Text, nullable=True)
    admin_replied_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    user = db.relationship('User', backref='product_reviews')

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_title": self.product.title if self.product else "Unknown Product",
            "user_email": self.user.email if self.user else "Anonymous",
            "product_rating": self.product_rating,
            "service_rating": self.service_rating,
            "comment": self.comment,
            "image_url": self.image_url,
            "is_verified_buyer": self.is_verified_buyer,
            "admin_reply": self.admin_reply,
            "admin_replied_at": self.admin_replied_at.isoformat() if self.admin_replied_at else None,
            "created_at": self.created_at.isoformat()
        }


# ==========================================
# --- EULOGY & DATA MODELS ---
# ==========================================

class Eulogy(db.Model):
    __tablename__ = "eulogies"
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    deceased_name = db.Column(db.String(150), nullable=False)
    birth_year = db.Column(db.String(4), nullable=True)
    passing_year = db.Column(db.String(4), nullable=True)
    occupation = db.Column(db.String(150), nullable=True)
    interests = db.Column(db.String(255), nullable=True)
    personality = db.Column(db.Text, nullable=False)
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

class PaymentTransaction(db.Model):
    __tablename__ = "payment_transactions"
    id = db.Column(db.Integer, primary_key=True)
    checkout_request_id = db.Column(db.String(128), unique=True, nullable=True)
    merchant_request_id = db.Column(db.String(128), unique=False, nullable=True)
    phone = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(150), nullable=True)
    amount = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "checkout_request_id": self.checkout_request_id,
            "merchant_request_id": self.merchant_request_id,
            "phone": self.phone,
            "email": self.email,
            "amount": self.amount,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }


# ==========================================
# --- ENTERPRISE ORDER & VERIFICATION SYSTEM ---
# ==========================================

class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), default="completed") # 'pending', 'completed'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    user = db.relationship('User', backref='orders')

    def to_dict(self):
        return {
            "id": self.id,
            "user_email": self.user.email if self.user else "Unknown",
            "total_amount": self.total_amount,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "items": [item.to_dict() for item in self.items]
        }

class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    
    product = db.relationship('Product', backref='order_items')

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_title": self.product.title if self.product else "Unknown Product",
            "quantity": self.quantity
        }
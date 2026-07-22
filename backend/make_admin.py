from app import create_app, db
from app.models import User

# Your specific admin email
MY_ADMIN_EMAIL = "stephenitwika178@gmail.com" 

app = create_app()

with app.app_context():
    user = User.query.filter_by(email=MY_ADMIN_EMAIL).first()
    
    if not user:
        print(f"Creating new admin account for {MY_ADMIN_EMAIL}...")
        user = User(email=MY_ADMIN_EMAIL, is_verified=True, is_admin=True)
        # Setting a default password just in case, though you can use Google SSO!
        user.set_password("100%Jesus/.") 
        db.session.add(user)
    else:
        user.is_admin = True
        
    db.session.commit()
    print(f"✅ SUCCESS: {MY_ADMIN_EMAIL} is officially a System Administrator!")
"""Process pending EulogyJob records: generate a simple QR code link and email assets.

Run periodically (cron) or manually:
    python backend/scripts/process_eulogy_jobs.py

This script will:
 - find pending eulogy jobs
 - render a QR (Google Chart API) containing the eulogy view URL
 - send an email with the QR image to the user email
 - mark job as sent
"""
from backend.app import create_app, db
from backend.app.models import EulogyJob, Eulogy
from flask_mail import Message
from datetime import datetime
import requests

app = create_app()

with app.app_context():
    jobs = EulogyJob.query.filter_by(status='pending').limit(10).all()
    if not jobs:
        print('No pending eulogy jobs.')
    for job in jobs:
        try:
            eulogy = Eulogy.query.get(job.eulogy_id)
            if not eulogy:
                job.status = 'failed'
                db.session.commit()
                continue

            # Construct public URL for the eulogy (assumes front-end route /eulogy/:id)
            base = app.config.get('FRONTEND_BASE_URL') or 'http://localhost:5173'
            eulogy_url = f"{base}/eulogy/{eulogy.id}"

            # Use Google Chart API to generate a QR image
            qr_api = 'https://chart.googleapis.com/chart'
            params = {
                'cht': 'qr',
                'chs': '300x300',
                'chl': eulogy_url,
                'choe': 'UTF-8'
            }
            qr_resp = requests.get(qr_api, params=params)
            if qr_resp.status_code != 200:
                print('Failed to fetch QR image, skipping job', job.id)
                continue

            qr_bytes = qr_resp.content

            # Send email with QR
            admin = app.config.get('MAIL_USERNAME')
            if job.user_email:
                msg = Message(subject='Your Digital Eulogy is Ready', sender=("Last Planner Julz Hub", admin), recipients=[job.user_email])
                msg.html = f"<p>Your eulogy is ready. Use the QR below to view or print the memorial tribute.</p><p><img src='cid:qrimage' alt='QR' /></p>"
                msg.attach('eulogy_qr.png', 'image/png', qr_bytes, 'inline', headers=[['Content-ID','<qrimage>']])
                try:
                    from backend.app import mail as mail_ext
                    mail_ext.send(msg)
                except Exception as e:
                    print('Failed to send eulogy email:', e)
                    # continue to mark as failed
                    job.status = 'failed'
                    db.session.commit()
                    continue

            job.status = 'sent'
            job.sent_at = datetime.utcnow()
            db.session.commit()
            print('Processed job', job.id)
        except Exception as e:
            print('Error processing job', job.id, e)
            job.status = 'failed'
            db.session.commit()

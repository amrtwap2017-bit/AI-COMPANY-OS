import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Environment, FileSystemLoader
from src.core.config import settings
from .repository import EmailRepository

class EmailService:
    def __init__(self, db: Session):
        self.db = db
        self.env = Environment(loader=FileSystemLoader(settings.TEMPLATES_DIR))

    def send_email(self, to_email: str, subject: str, template_name: str, context: dict = None):
        template = self.env.get_template(template_name + '.html')
        html_content = template.render(context)

        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())

        self.db_repo = EmailRepository(self.db)
        self.db_repo.create_log(to_email=to_email, subject=subject, template_name=template_name, context=context)
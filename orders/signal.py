from .models import Assignment
from django.db.models.signals import post_save
from django.core.mail import send_mail

def send_email(sender,**kwargs):
  #our reciver,
  #send email notification once list is assigned
  subject = "URGENT - Incoming Assignment."
  message = "Login to view Assignment."
  sender = "Assignment Notifications"
  if kwargs.get('created',True):

    return send_mail(subject,message,sender,["markmusasizi@gmail.com"])
  #handle a possible error here
  else:
    return None

post_save.connect(send_email,sender=Assignment)

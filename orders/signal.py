from .models import Assignment
from django.db.models.signals import post_save
from django.core.mail import send_mail
from django.contrib.auth.models import User

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

#configure user signup signals here as well
def user_signup(sender,**kwargs):
  #our receiver,
  #send notification on user creation
  subject = "Woot Woot, New user just signed up"
  message = "Login to check em out."
  sender = " Sign up Notifications"
  if kwargs.get('created',True):
    return send_mail(subject,message,sender,['markshelprwanda@gmail.com'])
  #handle a possible error here
  else:
   return None
post_save.connect(user_signup,sender=User)

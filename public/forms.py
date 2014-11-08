from django import forms

#Contact us form
class ContactUs(forms.Form):
  name = forms.CharField(max_length= 75)
  email = forms.EmailField()
  message = forms.CharField(widget=forms.Textarea(
                           attrs={'rows': 26,
                                  'cols': 40,
                                  'style': 'height: 7em;'}),max_length=140)

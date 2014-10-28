"""
Override Forms and validation code for user registration.

Note that all of these forms assume Django's bundle default ``User``
model; since it's not possible for a form to anticipate in advance the
needs of custom user models, you will need to write your own forms if
you're using a custom model.

"""
from __future__ import unicode_literals


from django import forms
from django.utils.translation import ugettext_lazy as _

from registration.users import UserModel


class RegistrationForm(forms.Form):
    """
    Form for registering a new user account.

    Validates that the requested emi is not already in use, and
    requires the password to be entered twice to catch typos.

    Subclasses should feel free to add any additional validation they
    need, but should avoid defining a ``save()`` method -- the actual
    saving of collected user data is delegated to the active
    registration backend.

    """
    required_css_class = 'required'

    email = forms.EmailField(label=_("E-mail"))
    username = forms.RegexField(regex=r'^[\w.@+-]+$',
                                max_length=30,
                                label=_("Username"),
                                required=False,
                                error_messages={'invalid': _("This value may contain only letters, numbers and @/./+/-/_ characters.")})

    password1 = forms.CharField(widget=forms.PasswordInput,
                                label=_("Password"))
    password2 = forms.CharField(widget=forms.PasswordInput,
                                label=_("Password (again)"))


    def clean_email(self):

      existing = UserModel().objects.filter(email__iexact=self.cleaned_data['email'])
      if existing.exists():
        raise forms.ValidationError(_("A user with that email already exists."))
      else:
        return self.cleaned_data['email']

    def clean_username(self):
        """
        The email should be used as the username.

        """
        self.cleaned_data['username']=''
        return self.cleaned_data['username']


    def clean(self):
        """
        Verifiy that the values entered into the two password fields
        match. Note that an error here will end up in
        ``non_field_errors()`` because it doesn't apply to a single
        field.

        """
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_("The two password fields didn't match."))
        return self.cleaned_data

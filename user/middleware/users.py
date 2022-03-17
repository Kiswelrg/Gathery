from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse
from django.http.response import HttpResponseRedirect


class LoginContentMiddleWare(MiddlewareMixin):
	def process_request(self,request):
		if request.path == "/u/loginc" and ('Referer' not in request.headers or request.headers['Referer'] != 'http://127.0.0.1:8000/u/login'):
			return HttpResponse('')
			
class SigninPageMiddleWare(MiddlewareMixin):
	def process_request(self,request):
		if request.path == "/u/signin" and 'username' in request.session:
			return HttpResponseRedirect('/')
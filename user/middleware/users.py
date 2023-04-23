from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponse,Http404
from django.http.response import HttpResponseRedirect
from django.urls import reverse


class LoginContentMiddleWare(MiddlewareMixin):
	def process_request(self,request):
		if request.path == "/u/loginc" and ('Referer' not in request.headers or request.headers['Referer'] != 'http://127.0.0.1:8000/u/login'):
			return HttpResponse('')
			
class SigninPageMiddleWare:
	def __init__(self, get_response):
			self.get_response = get_response
		# One-time configuration and initialization.

	def __call__(self,request):
		#redirect if login ed
		except_list1 = ['sign-in', 'log-in']
		print(request.path)
		for name in except_list1:
			if request.path == reverse('user:' + name):
				if request.session.has_key("username") and request.session["username"]:
					return HttpResponseRedirect('/')

		response = self.get_response(request)

		#something afterwards
		return response

	
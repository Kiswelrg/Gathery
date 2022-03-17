from django.urls import path
#from django.conf.urls import url
from . import views

app_name = 'user'
urlpatterns = [
	path('',views.Index),
	path('checkid/',views.Checkid),
	path('signup/',views.Signup, name='sign-up'),
	path('regist/',views.signup),
	path('signin/',views.Signin, name='sign-in'),
	path('vcode/',views.Vcode),
	path('login/',views.Login),
	path('logout/',views.Logout),
	path('token/',views.getToken),
	#--
	#
	
]
from django.urls import path, re_path
#from django.conf.urls import url
from . import views

app_name = 'gallery'
urlpatterns = [
	path('',views.Index, name = 'index'),
	path('home/',views.Home, name = 'home'),
	re_path(r'^search/(?:(?P<page>[0-9]{1,3})(?:[&=\w]+)/)?$',views.Search, name = 'search'),
	re_path(r'^searchold/(?:(?P<page>[0-9]{1,3})(?:[&=\w]+)/)?$',views.SearchOld, name = 'search'),
	path('getArt/',views.getArt, name = 'get-art'),
	path('getUser/', views.getUserRelation, name='get-user'),
	path('getStaff/',views.getStaff, name = 'get-staff'),
	path('getWarehouse/',views.getWarehouse, name = 'get-wh'),
	path('getGallery/',views.getGallery, name = 'get-gly'),
	path('crtart/',views.crtArt),
	path('crtwarehouse/',views.crtWarehouse),
	path('crtgallery/',views.crtGallery, name = 'crt-gly-page'),
	path('crtgallerys/',views.crtgallery, name = 'crt-gly'),
	path('manage/',views.galleryManage),
	path('importart/',views.importArt),
	path('importarts/', views.importarts, name = 'import-arts'),
	path('editStaff/', views.editStaff, name="edit-staff"),
	path('editWarehouse/', views.editWarehouse, name="edit-warehouse"),
	path('editArt/', views.editArt, name="edit-art"),
	re_path(r'^(?P<gId>[A-Z][A-Z0-9]{9})(?:\/)$',views.galleryManage),
	#--
	
]
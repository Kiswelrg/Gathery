from django.utils.deprecation import MiddlewareMixin
from django.http import HttpResponseRedirect,HttpResponse,Http404
from django.urls import reverse

class LoginRequireMiddleWare(MiddlewareMixin):
        def __init__(self, get_response):
            self.get_response = get_response
        # One-time configuration and initialization.

        def __call__(self,request):
            #need to login
            except_list1 = ['/gallery/']
            if request.path[0:8] == '/gallery' and request.path not in except_list1:
                if not request.session.has_key("username") or not request.session["username"]:
                    return HttpResponseRedirect("/u/signin")

            #need to be POST
            except_list2 = ['import-arts', 'crt-gly', 'edit-warehouse', 'edit-staff', 'edit-art']
            for name in  except_list2:
                name = reverse('gallery:' + name)
            
            if request.path in except_list2  and request.method != "POST":
                raise Http404('Invalid request!')

            response = self.get_response(request)

            #something afterwards

            return response


            
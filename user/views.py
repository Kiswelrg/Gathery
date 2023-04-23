from urllib import request
from django.http.response import HttpResponseRedirect
from django.shortcuts import render
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.http import HttpResponse
from django.middleware.csrf import get_token
from .models import User
from django.core.exceptions import ValidationError
import os
import hashlib
from django.urls import reverse

# Create your views here.

def checkVcode(request):
    if request.method == "POST":
        if request.POST.get('vcode') != '':
            r_num = request.session.get('code').lower()
            if r_num == request.POST.get('vcode').lower():
                return True
    return False

def Checkid(request):
    return HttpResponse(User.objects.filter(username = request.GET['un']).exists())

def getToken(request):
    return HttpResponse(get_token(request))

def Index(request):
    return render(request,'user/index.html')

def Signin(request):
    print('test: ', request.GET.get('a'))
    return render(request,'user/signin.html')

def Signup(request):
    return render(request,'user/signup.html')

def signup(request):
    print(request.POST)
    if checkVcode(request):
        pwd = request.POST.get('pwd')
        pwd = hashlib.sha256(pwd.encode('utf-8')).hexdigest()
        pwd = hashlib.sha256((pwd + 'vr').encode('utf-8')).hexdigest()
        u = User(
            username=request.POST.get('username'),
            password = pwd
        )
        try:
            u.clean_fields()
        except ValidationError:
            return HttpResponseRedirect(reverse('user:sign-up') + '?username=0')
        u.save()
    else:
        return HttpResponseRedirect('/?vcode=0')
    
    return HttpResponseRedirect('/u/signin')

@xframe_options_sameorigin
def loginContent(request):
    return render(request,'loginc.html')
    
def Login(request):
    print('处理登录表单')
    if request.method == "POST":
        if request.POST.get('username') != '' and request.POST.get('pwd') != '' and request.POST.get('vcode') != '':
            u = request.POST.get('username')
            p = request.POST.get('pwd')
            r_num = request.session.get('code').lower()
            try:
                get_user = User.objects.get(username = u)
                if r_num == request.POST.get('vcode').lower():
                    pwd_hash = get_user.password
                    password = hashlib.sha256(p.encode('utf-8')).hexdigest()
                    if pwd_hash == hashlib.sha256((password + 'vr').encode('utf-8')).hexdigest():
                        request.session["username"] = u
                        request.session["uid"] = get_user.id
                        if request.GET.get('wish') is None:
                            print('回主页')
                            return HttpResponseRedirect('/')
                        else:
                            print('去之前点的页面')
                            print('wish: ' + request.GET.get('wish'))
                            return HttpResponseRedirect(request.GET.get('wish'))
                    else:
                        return HttpResponseRedirect(reverse('user:sign-in') + '?username=0')
                else:
                    return HttpResponseRedirect(reverse('user:sign-in') + '?vcode=0')
            except User.DoesNotExist:
                return HttpResponseRedirect(reverse('user:sign-in') + '?username=0')
        else:
            return HttpResponseRedirect(reverse('user:sign-in'))
    return HttpResponseRedirect(reverse('user:sign-in'))

def Logout(request):
    if request.session.has_key("username") and request.session["username"]:
        del request.session["username"], request.session["uid"]
    return HttpResponseRedirect('/')

def Vcode(request):
    width = 90
    height = 35
    size = (width,height)
    #定义背景色
    import random
    bg_color = (random.randrange(20,100),random.randrange(20,100),random.randrange(20,100))
    from PIL import Image,ImageDraw,ImageFont
    img = Image.new('RGB',size,bg_color)
    draw = ImageDraw.Draw(img)
    for i in range(100):
        #位置
        point_position = (random.randrange(0,width),random.randrange(0,height))
        #颜色
        point_color = (random.randrange(0,255),255,random.randrange(0,255))
        draw.point(point_position,fill=point_color)
    nums =[]    
    #数字
    for i in range(48,58):
        nums.append(chr(i)) 
    #小写英文字母
    for i in range(97,123):
        nums.append(chr(i)) 
    #大写英文字母
    for i in range(65,91):
        nums.append(chr(i))

    nums = [n for n in  nums if n not in '0Ol']

    code_str = ""
    for i in range(4):
        code_str+=nums[random.randrange(0,len(nums))]
    request.session["code"] = code_str.lower()
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    font_family =  ImageFont.truetype(os.path.join(BASE_DIR, 'static') + '/wss/Chalkboard.ttc',25)   
    font_color=(255,random.randrange(0,255),random.randrange(0,255))
    draw.text((5,0),text=code_str[0],font=font_family,fill=font_color)
    draw.text((width/4,0),text=code_str[1],font=font_family,fill=font_color)
    draw.text((width/2,0),text=code_str[2],font=font_family,fill=font_color)
    draw.text((width*3/4,0),text=code_str[3],font=font_family,fill=font_color)
    del draw
    import io
    buf = io.BytesIO()
    img.save(buf,'png')
    return HttpResponse(buf.getvalue(),'image/png')
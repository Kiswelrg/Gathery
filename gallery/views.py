from django.http.response import Http404, HttpResponseRedirect
from django.urls import reverse
from django.shortcuts import redirect, render, get_list_or_404
from django.views.decorators.clickjacking import xframe_options_sameorigin
from django.http import HttpResponse
from user.models import User
from .models import GU_Relation,WU_Relation,Gallery,Warehouse,Artist,Art
from django.utils.datastructures import MultiValueDictKeyError
from django.utils import timezone
from django.db.models import F, Count

from datetime import datetime, timedelta
from datetime import timezone as ptz
from django.core.exceptions import ObjectDoesNotExist
import json
from itertools import islice

from .dbutil import validateGW, fetchGallery, ableToGrant, highestBit

""" get api section section """

def getStaff(request):
    """ m {
        0全部
        1GU
        2WU
    } """
    form_list = [
                'm',
                'g',
                ]
    try:
        for i in form_list:
            request.GET[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')
    g = Gallery.objects.get(galleryId = request.GET.get('g'))
    max_per_request = 50
    wu = []
    gu = []
    if request.GET.get('m') == '0':
        remain = max_per_request - g.gu_relation_set.all().count()
        if remain > 0:
            ws = Warehouse.objects.filter(gallery = g)
            wu = WU_Relation.objects.filter(warehouse__in = ws)[:remain].values(
                'privilege',
                'warehouse__urlCode',
                'warehouse__name',
                'date_join',
                'status',
                employee_id = F('staff_member__urlCode'), employee_n = F('staff_member__name'))
            gu = g.gu_relation_set.all().values(
                'privilege',
                'role',
                'date_join',
                'status',
                employee_id = F('staff_member__urlCode'), employee_n = F('staff_member__name'))
        else:
            gu = g.gu_relation_set.all()[:max_per_request].values(
                'privilege',
                'role',
                'date_join',
                'status',
                employee_id = F('staff_member__urlCode'), employee_n = F('staff_member__name'))

    for u in gu:
        u['date_join'] = u['date_join'].astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d  %H:%M:%S')
    for u in wu:
        u['date_join'] = u['date_join'].astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d  %H:%M:%S')
        
    return HttpResponse(json.dumps({
            'g_staff': list(gu),
            'w_staff': list(wu),
        }))


def getUserRelation(request):
    print(request.GET)
    form_list = ['csrfmiddlewaretoken',
                'm'
    ]
    try:
        for i in form_list:
            request.GET[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')

    u = request.session.get('uid')
    wuc = request.GET.get('w')
    gid = request.GET.get('g')
    if request.GET.get('m') == 'gu':
        if gid is not None and gid != '':
            gur = GU_Relation.objects.filter(gallery__galleryId = gid, staff_member__id = u)
            if len(gur) > 0:
                return HttpResponse(json.dumps({
                    'type': 'gu',
                    'user': gur.values('role','privilege')[0]
                }))
        else:
            w = Warehouse.objects.filter(urlCode = wuc)
            if len(w):
                gur = GU_Relation.objects.filter(gallery = w.gallery, staff_member__id = u)
                if len(gur) > 0:
                    return HttpResponse(json.dumps({
                        'type': 'gu',
                        'user': gur.values('role','privilege')[0]
                    }))
    elif request.GET.get('m') == 'wu':
        if wuc is not None and wuc != '':
            wur = WU_Relation.objects.filter(warehouse__urlCode = wuc, staff_member__id = u)
            if len(wur) > 0:
                return HttpResponse(json.dumps({
                    'type': 'wu',
                    'user': wur.values('privilege')[0]
                }))
    raise Http404('wow u got a 404!?')


def getGallery(request, page=1):
    u = request.session.get('uid')
    r = fetchGallery(u, page)
    if r == 404:
        raise Http404('1')
    else:
        return HttpResponse(r)
        

def getWarehouse(request, page=1):
    un = request.session.get('username')
    g_gid = request.GET.get('gallery')
    try:
        if g_gid == '' or g_gid is None:
            g = Gallery.objects.filter(gu_relation__staff_member = User.objects.get(username=un))[0]
        else:
            g = Gallery.objects.filter(galleryId = g_gid)[0]
    except IndexError:
        raise Http404('you own or are in charge of no gallery, please create one first!')
    res = g.warehouses.all()[page*10-10:page*10]
    if request.GET.get('m') == '1':
        res = res.values('name', 'date_create', 'date_add', 'art_num', 'status',  w_id = F('urlCode')).annotate(temporary_staff_num = Count('staff'))
        for w in res:
            w['date_add'] = w['date_add'].astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d  %H:%M:%S')
            w['date_create'] = w['date_create'].astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d  %H:%M:%S')
        res = res[0:10]
        return HttpResponse(json.dumps(res))
    else:
        res = res.values('name', w_id = F('urlCode'))
        return HttpResponse(res)


# Create your views here.
""" page section """

def Index(request):
    return HttpResponseRedirect(reverse('gallery:home', current_app=request.resolver_match.namespace))


def Home(request):
    return render(request,'gallery/home.html')


def galleryManage(request, gId = ''):
    return render(request, 'gallery/manage.html')


def importArt(request):
    u = request.session.get('uid')
    a = fetchGallery(u, 1)
    if a == 404:
        c = {}
    else:
        c = {'g_results': a}
    return render(request, 'gallery/importart.html', c)

def Tpl(request):
    return render(request,'test_extended.html')


def Search(request, page=1):
    u = request.session.get('uid')
    a = fetchGallery(u, page)
    if a == 404:
        c = {}
    else:
        c = {'g_results': a}
    return render(request, 'gallery/searchNew.html', c)


def SearchOld(request, page=1):
    u = request.session.get('uid')
    a = fetchGallery(u, page)
    if a == 404:
        c = {}
    else:
        c = {'g_results': a}
    return render(request, 'gallery/search.html', c)
    
""" page section end """

""" update api section section """

# sesrch art
def getArt(request):
    print(request.GET)
    form_list = ['csrfmiddlewaretoken',
                'scode',
                'gallery',
                'warehouse',
                'name',
                'id',
                'status',
                'date_add',
                'artist',
                'date_made',
                'tags',
                ]
    try:
        for i in form_list:
            a = request.GET[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')

    if request.GET['scode'] != '':
        pass
    else:
        params = request.GET

    uid = request.session.get('uid')

    search = Art.objects.all()
    ws = []
    a,b = validateGW(params['galleryId'], params['whId'], uid)
    if b:
        ws = a
    else:
        raise Http404(a)

    if len(ws) > 0:
        search = search.filter(warehouse__in = ws)
    if params['name'] != '':
        search = search.filter(name__contains = params['name'])
    if params['id'] != '':
        search = search.filter(id__contains = params['id'])
    status_dict = {
        '在库': '1',
        '损坏': '0',
        '运输': '2',
        '出借': '3',
        '借入': '4',
        '已售': '5',
    }
    if params['status'] != '' and status_dict.get(params['status']):
        search = search.filter(status = status_dict.get(params['status']))

    date_check = [
        {1:'date_add', 2:'da_opt'},
        {1:'date_made', 2:'dm_opt'},
    ]
    if params['date_add'] != '':
        d1 = datetime.strptime(params['date_add'],'%Y-%m-%d')
        d1_tz = datetime(d1.year,d1.month,d1.day, tzinfo=timezone.get_current_timezone())
        margs = dict()
        if params['da_opt'] == '0':
            margs['date_add__lte'] = d1_tz
        if params['da_opt'] == '1':
            margs['date_add__gte'] = d1_tz 
        if params['da_opt'] == '2':
            margs['date_add'] = d1_tz
        search = search.filter(**margs)

    if params['date_made'] != '':
        d1 = datetime.strptime(params['date_made'],'%Y-%m-%d')
        d1_tz = datetime(d1.year,d1.month,d1.day, tzinfo=timezone.get_current_timezone())
        margs = dict()
        if params['da_opt'] == '0':
            margs['date_made__lte'] = d1_tz
        if params['da_opt'] == '1':
            margs['date_made__gte'] = d1_tz 
        if params['da_opt'] == '2':
            margs['date_made'] = d1_tz
        search = search.filter(**margs)
        
    #...
    if params['artist'] != '':
        search = search.filter(author = params['artist'])

    search = search.annotate(
        gallery = F('warehouse__gallery__name'),
        galleryId = F('warehouse__gallery__galleryId'),
        wh_name = F('warehouse__name'),
        wh_id = F('warehouse__urlCode'),
        ).values(
            'name',
            'id',
            'author',
            'date_made',
            'date_add',
            'gallery',
            'galleryId',
            'wh_name',
            'wh_id',
            'rack',
            'status'
            )

    for art in search:
        art['date_add'] = art['date_add'].astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d')
        art['date_made'] = art['date_made'].astimezone(timezone.get_current_timezone()).strftime('%Y-%m-%d')

    max_per_page = 20
    start = int(params['page'])*max_per_page - max_per_page
    end = start + max_per_page
    res = search[start:end]
    return HttpResponse(json.dumps(res)[:-1] + ', {"artNum" : %d }' % search.count() + ', {"user" : "%s" }]' % request.session['username'])


def crtArt(request):
    return HttpResponse('')


def crtWarehouse(request):
    return HttpResponse('')


def crtGallery(request):
    return render(request,'gallery/create.html')


def crtgallery(request):
    print(request.POST)
    form_list = ['name',
                'city',
                'date_create'
                ]
    try:
        for i in form_list:
            request.POST[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')
        
    ws = json.loads(request.POST['ws'])
    if len(ws) == 0:
        raise Http404('wow u got a 404!?')

    u = request.session.get('uid')
    d1 = datetime.strptime(request.POST['date_create'],'%Y-%m-%d')
    g = Gallery.objects.create(
        name = request.POST['name'],
        # city = NULL,
        date_create = d1.replace(tzinfo=timezone.get_current_timezone())
        );
    gu_r = GU_Relation(gallery = g, staff_member = User.objects.get(id=u), role='0')
    gu_r.save()
    batch_size = 100
    try :
        objs = []
        for w in ws:
            p = {}
            p['name'] = w['name']
            p['gallery'] = g
            objs.append(Warehouse(**p))
        
        objs = (o for o in objs)
        while True:
            batch = list(islice(objs, batch_size))
            if not batch:
                break
            Warehouse.objects.bulk_create(batch, batch_size)
    except KeyError:
        g.delete()
        raise KeyError
    return HttpResponse({
        'redirect': 0,
        'url': reverse('gallery:search')
    })
    return render(request,'gallery/search.html')


def importarts(request):
    print(request.POST)
    form_list = ['wh',
                'arts',
                'mode'
                ]
    try:
        for i in form_list:
            a = request.POST[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')
        
    arts = json.loads(request.POST['arts'])
    if len(arts) == 0:
        raise Http404('wow u got a 404!?')

    # print(arts[0])
    # for key, value in arts[0].items():
    #     print(key, '' , value)
    u = request.session.get('uid')
    try:
        u_pri = GU_Relation.objects.get(staff_member__id = u, gallery = g).privilege
    except ObjectDoesNotExist:
        try:
            u_pri = WU_Relation.objects.get(staff_member__id = u, warehouse = w).privilege
        except ObjectDoesNotExist:
            raise Http404('authentication forbidden')
    if not(u_pri & 0b000000000000010):
        raise Http404('wow u got a 404!?')
    if request.POST['mode'] == '0':
        try:
            w = Warehouse.objects.get(urlCode = int(request.POST['wh']))
        except Warehouse.DoesNotExist:
            raise Http404('wow u got a 404!?')
        for a in arts:
            a['wh'] = w

    td_list = ['date made', 'last transit']
    for a in arts:
        for d in td_list:
            if a.get(d) is not None:
                # datetime.fromisoformat('2011-11-04T00:05:23+04:00')   
                a[d] = datetime.strptime(a[d],'%Y-%m-%dT%H:%M:%S.000Z')
                #print(a[d])
                #a[d] = a[d].replace(tzinfo=ptz.utc)
                a[d] = a[d].replace(tzinfo=ptz(timedelta(hours=int(request.POST['tz']))))
                #print(a[d])


    batch_size = 100
    try :
        objs = []
        last_wh = None
        last_w = None
        for a in arts:
            p = {}
            p_h = [
                ['name'],
                ['urlCode'],
                ['id'],
                ['date_made','date made'],
                ['date_add','date add'],
                ['warehouse','wh'],
                ['last_transit', 'last transit'],
                ['rack'],
                ['type'],
                ['author'],
                ['status']
            ]
            if request.POST['mode'] == '0':
                p['warehouse'] = w
            else:
                wh = a.get('wh')
                if last_wh != wh:
                    try:
                        last_w = Warehouse.objects.get(urlCode = wh)
                    except Warehouse.DoesNotExist:
                        raise Http404('wow u got a 404!?')
                    last_wh = wh

            p['warehouse'] = last_w
            for h in p_h:
                if a.get(h[-1]) is not None:
                    p[h[0]] = a.get(h[-1])
            # print(p)
            objs.append(Art(**p))
        
        objs = (o for o in objs)
        while True:
            batch = list(islice(objs, batch_size))
            if not batch:
                break

            #暂时换一下数据类型， 之后每个数据类型都检查， 在所有作品准备导入之前

            Art.objects.bulk_create(batch, batch_size)
    except KeyError:
        raise KeyError
    return HttpResponse('success import!')


def editStaff(request):
    print(request.POST)
    form_list = [
                'm',
                'type',         #0 gu, 2 wu, 1 gu->wu, 3 wu->gu
                'w',
                'g',
                'employee',
                'info'
                ]
    info_list = [
        'role',
        'privilege',
        'status',
        'date_join'
    ]
    try:
        for i in form_list:
            request.POST[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')

    u = request.session.get('uid')
    g = Gallery.objects.get(galleryId = request.POST.get('g'))
    if request.POST.get('w') != '':
        w = Warehouse.objects.get(urlCode = int(request.POST['w']))
    try:
        u_role = GU_Relation.objects.get(staff_member__id = u, gallery = g).role
        u_pri = GU_Relation.objects.get(staff_member__id = u, gallery = g).privilege
    except ObjectDoesNotExist:
        try:
            u_role = '3'
            u_pri = WU_Relation.objects.get(staff_member__id = u, warehouse = w).privilege
        except ObjectDoesNotExist:
            raise Http404('wow u got a 404!1')

    p = json.loads(request.POST['info'])
    for i in info_list:
        if p[i] == '':
            p.pop(i,None)
    ee = json.loads(request.POST['employee'])

    p['privilege'] = int(p['privilege'])

    if int(p['role']) < int(u_role) or p['privilege'] > u_pri:
        if ableToGrant(u_pri) < p['privilege']:
            raise Http404('wow u got a 404!2')
        if u == ee['ph']:
            p['privilege'] = u_pri
    
    # 可以不用在这里
    if request.POST['m']!='2' and p.get('date_join', None) is not None:
        p['date_join'] = datetime.strptime(p['date_join'], '%Y-%m-%d')
    ty = int(request.POST['type'])
    grant = ableToGrant(p['privilege'])
    staff = User.objects.get(urlCode = ee['ph'])

    
    if request.POST['m'] == '0':    #update
        if ty == 0:
            GU_Relation.objects.filter(gallery = g, staff_member__urlCode = ee['ph']).update(**p)      
        if ty == 3:
            p.pop('role', None)
            WU_Relation.objects.filter(warehouse = w, staff_member__urlCode = ee['ph']).update(**p)
        if ty == 1:
            GU_Relation.objects.filter(gallery = g, staff_member__urlCode = ee['ph']).delete()
            p['warehouse'] = w
            p['staff_member'] = staff
            p.pop('role', None)
            WU_Relation.objects.create(**p)
        if ty == 2:
            WU_Relation.objects.filter(warehouse = w, staff_member__urlCode = ee['ph']).delete()
            p['gallery'] = g
            p['staff_member'] = staff
            GU_Relation.objects.create(**p)
    elif request.POST['m'] == '1':
        if ty == 0:
            p['gallery'] = g
            p['staff_member'] = staff
            gu = GU_Relation.objects.create(**p)
        elif ty == 1:
            p['warehouse'] = w
            p['staff_member'] = staff
            p.pop('role', None)
            wu = WU_Relation.objects.create(**p)
    elif request.POST['m'] == '2':
        if ty == 0:
            GU_Relation.objects.get(gallery = g, staff_member__urlCode = ee['ph']).delete()
        if ty == 1:
            WU_Relation.objects.get(warehouse = w, staff_member__urlCode = ee['ph']).delete()

    return HttpResponse(True)


def editWarehouse(request):
    print(request.POST)
    form_list = [
                'm',
                'w',
                'g',
                'info',
                ]
    info_list = [
                'name',
                'status',
                'date_create',
                'date_add',
                ]
    try:
        for i in form_list:
            request.POST[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!?')
    m = int(request.POST['m'])
    u = request.session.get('uid')


    if m != 1:
        if request.POST['w'] != '':
            w = Warehouse.objects.get(urlCode = int(request.POST['w']))
            g = w.gallery
        else:
            raise Http404('wow u got a 404!1')
        try:
            u_pri = GU_Relation.objects.get(staff_member__id = u, gallery = g).privilege
        except ObjectDoesNotExist:
            try:
                u_pri = WU_Relation.objects.get(staff_member__id = u, warehouse = w).privilege
            except ObjectDoesNotExist:
                raise Http404('wow u got a 404!2')
    else:
        try:
            g = Gallery.objects.get(galleryId = request.POST['g'])
        except ObjectDoesNotExist:
                raise Http404('wow u got a 404!3')
        try:
            u_pri = GU_Relation.objects.get(staff_member__id = u, gallery = g).privilege
        except ObjectDoesNotExist:
            raise Http404('wow u got a 404!4')

    p = json.loads(request.POST['info'])
    for i in info_list:
        if p[i] == '':
            p.pop(i,None)
    status = p['status']
    if status < 0 or status > 3:    raise Http404('wow u got a 404!3')
    try:
        if m == 0 and u_pri & 0b000000000100000:
            if request.POST['g'] == '' or request.POST['g'] == g.galleryId:
                for k,v in p.items():
                    setattr(w, k, v)
                w.save()
            else:
                targetPri = GU_Relation.objects.filter(staff_member__id = u, gallery__galleryId = request.POST['g'])
                if len(targetPri) and (targetPri[0].privilege & 0b10000):
                    GU_Relation.objects.get(gallery=g,staff_member__id = u).delete()
                    p['gallery'] = targetPri[0].gallery
                    p['staff_member'] = User.objects.get(id = u)
                    GU_Relation.objects.create(**p)
                else:
                    raise Http404('wow u got a 404!4')
        elif m == 1 and u_pri & 0b000000000010000:
            p['gallery'] = g
            w = Warehouse.objects.create(**p)
        elif m == 2 and u_pri & 0b000000000010000:
            if w:
                w.delete()
    except AttributeError:
        raise Http404('wow u got a 404!5')
    return HttpResponse('editing w')


def editArt(request):
    print(request.POST)
    form_list = [
                'm',
                'w',  # 是否换库房
                'info'
                ]
    info_list = [
        'id',
        'name',
        'status',
        'date_made',
        'date_add'
    ]
    
    try:
        for i in form_list:
            request.POST[i]
    except MultiValueDictKeyError:
        raise Http404('wow u got a 404!1')
    
    m = request.POST.get('m')
    if m == '':
        raise Http404('wow u got a 404!1')
    m = int(m)
    p = json.loads(request.POST['info'])
    
    for i in info_list:
        if p[i] == '':
            p.pop(i,None)
    for i in range(3,5):
        if p.get(info_list[i]) != None:
            p[info_list[i]] = p[info_list[i]].astimezone(timezone.get_current_timezone())
    
    if p.get('id') is not None and p.get('id') != '':
        try:
            a = Art.objects.get(id=p.get('id'))
        except Art.DoesNotExist:
            raise Http404('wow u got a 404!2')
    elif m != 1:
        raise Http404('wow u got a 404!3')

    u = request.session.get('uid')
    if m != 1:
        w = a.warehouse
        g = w.gallery
    else:
        if request.POST.get('w') == '':
            raise Http404('authentication forbidden')
        try:
            w = Warehouse.objects.get(urlCode = request.POST.get('w'))
        except ObjectDoesNotExist:
            raise Http404('authentication forbidden')
        g = w.gallery
    
    try:
        u_pri = GU_Relation.objects.get(staff_member__id = u, gallery = g).privilege
    except ObjectDoesNotExist:
        try:
            u_pri = WU_Relation.objects.get(staff_member__id = u, warehouse = w).privilege
        except ObjectDoesNotExist:
            raise Http404('authentication forbidden')
    print('pri : ', u_pri)
    if m == 0 and u_pri & 0b000000000000100:
        w_to = request.POST['w']
        
        if w_to != '' and w_to != w.urlCode:
            w2 = Warehouse.objects.filter(urlCode = w_to)
            if len(w2) == 0:
                raise Http404('authentication forbidden')
            g2 = w2[0].gallery
            gur = GU_Relation.objects.filter(gallery = g2, staff_member__id = u)
            if len(gur)==0 or not(gur[0].privilege & 4):
                wur = WU_Relation.objects.filter(warehouse = w2, staff_member__id = u)
                if len(wur)==0 or not (wur[0].privilege & 4):
                    raise Http404('authentication forbidden')
            
            p['warehouse'] = w2[0]
        p.pop('id', None)
        print(p)
        for k,v in p.items():
            setattr(a, k, v)
        print(a)
        a.save()
    elif m == 1 and u_pri & 0b000000000000010:
        
        p['warehouse'] =  w
        p.pop('id', None)
        a2 = Art.objects.create(**p)
        print(a2)
    elif m == 2 and u_pri & 0b000000000000100:
        a.delete()
    
    return HttpResponse('editing a')

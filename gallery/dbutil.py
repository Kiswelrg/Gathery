from .models import GU_Relation,WU_Relation,Gallery,Warehouse,Artist,Art
from django.core.exceptions import ObjectDoesNotExist
from user.models import User

def validateGW(gId, wCode, uid):
    v = False
    hint = ''
    ws = []
    if gId != '':
        g = checkGU(gId, uid)
        if len(g) > 0:
            if wCode != '':
                try:
                    ws.append(Warehouse.objects.get(gallery__galleryId = gId, urlCode = wCode))
                    v = True
                except Warehouse.DoesNotExist:
                    hint = 'g does not have this w (g management exists) 11'
                    print(hint)
            else:
                ws = [w for w in Warehouse.objects.filter(gallery = g[0])[:5]]
                if len(ws) == 0:
                    hint = 'empty gallery (g management exists) 10'
                    print(hint)
                else:
                    v = True
        else:
            if wCode != '':
                r = checkWU(wCode, uid)
                if len(r) > 0:
                    ws = r
                    v = True
                    print('only has WU management 11')
            else:
                ws = [w for w in Warehouse.objects.filter(wu_relation__staff_member__id = uid, wu_relation__warehouse__gallery__galleryId = gId)[:5]]
                if len(ws) == 0:
                    hint = 'g permission denied (no g/w management ) 11'
                    print(hint)
                else:
                    v = True
                    print('only w management (no g management) 10')
    else:
        wn = 0
        try:
            g = Gallery.objects.filter(staff__id = uid).first()
            if wCode == '':
                ws = [w for w in Warehouse.objects.filter(gallery = g)[:5]]
            else:
                ws.append(Warehouse.objects.get(gallery = g, urlCode = wCode))
            if len(ws) == 0:
                hint = 'permission denied'
            else:
                v = True
        except ObjectDoesNotExist:
            p = {}
            p['wu_relation__staff_member__id'] = uid
            if wCode == '':
                p['wu_relation__warehouse__urlCode'] = wCode
                wn = 5
            else:
                wn = 1
                ws = [w for w in Warehouse.objects.filter(p)[:wn]]
                if len(ws) == 0:
                    hint = 'permission denied'
                else:
                    v = True
    if v:
        return ws, v
    else:
        return hint, v


def checkGU(gId, uid):
    try:
        g = Gallery.objects.get(galleryId = gId)
        return [GU_Relation.objects.get(gallery = g, staff_member__id = uid).gallery]
    except ObjectDoesNotExist:
        return []

def checkWU(wId, uid):
    try:
        w = Gallery.objects.get(urlCode = wId)
        return [WU_Relation.objects.get(Warehouse = w, staff_member__id = uid).warehouse]
    except ObjectDoesNotExist:
        return []

def fetchGallery(u, page):
    try:
        g_bundle = Gallery.objects.filter(staff__id = u).order_by('date_create')[page*10-10:page*10].values('name', 'galleryId')
        return g_bundle
    except User.DoesNotExist:
        return 404


def ableToGrant(p):
    base = [
     0b000000000001000,
     0b000000001000000,
     0b000000100000000,
     0b000001000000000
    ]
    return p&base[0] + p&base[1] + p&base[2] + p&base[3]

def highestBit(n):
    i=0
    while n:
        n = n >> 1
        i += 1
    return i
import random, string
from . import models
from functools import partial


#000 [num,upper,lower]
def randomId(N, opt):
    head = random.choices( (opt&0b001 )*string.ascii_lowercase + (opt&0b010 )*string.ascii_uppercase + ( 0b100 )*string.digits, k=1)[0]
    body = ''.join(random.choices( (opt&0b001 )*string.ascii_lowercase + (opt&0b010 )*string.ascii_uppercase + string.digits, k=N-1))
    return head + body


def getArtId():
    a = randomId(8,0b011)
    while models.Art.objects.filter(id = a).exists():
        a = randomId(8,0b011)
    return str(a)

def getGalleryId():
    a = randomId(10,0b010)
    while models.Gallery.objects.filter(galleryId = a).exists():
        a = randomId(8,0b011)
    return str(a)


def getXCode(name,base,r):
    f = {
        'art': (models.Art),
        'artist': (models.Artist),
        'gallery': (models.Gallery),
        'warehouse': (models.Warehouse),
    }[name]
    
    print(f)
    bot = pow(10, r - 4)
    head = pow(10, r - 3) 
    a = random.randint(bot, head-1) + base*head

    while f.objects.filter(urlCode = a).exists():
        a = random.randint(bot, head-1) + base*head
    return int(a)

def getArtistCode():
    return getXCode('artist',355,7)

def getArtCode():
    return getXCode('art',201,10)

def getGalleryCode():
    return getXCode('gallery',627,7)

def getWarehouseCode():
    return getXCode('warehouse',628,8)
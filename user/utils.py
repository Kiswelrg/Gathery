import random,string
from . import models

def getUserCode():
    #at most
    #a = random.randint(1000000000, 9999999999)

    #but now
    a = random.randint(1000000, 9999999) + 103*10000000

    while models.User.objects.filter(urlCode = a).exists():
        a = random.randint(1000000, 9999999) + 102*10000000
    return int(a)


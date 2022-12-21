python3 -m pip install virtualenv
python3 -m virtualenv venv
source venv/bin/activate
python3 -m pip install -r requirements.txt
rm -f venv/lib/python3.10/site-packages/pgeocode.py
python3 -m pip install gdown
python3 -m pip install django-cors-headers
python3 setup.py
cp pgeocode.py venv/lib/python3.10/site-packages/
mkdir data
cp GeoLite2-City.mmdb data/
cp GeoLite2-Country.mmdb data/
rm -f GeoLite2-City.mmdb
rm -f GeoLite2-Country.mmdb
python3 manage.py makemigrations
python3 manage.py migrate
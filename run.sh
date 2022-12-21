cd PB
chmod +rwx run.sh
python3 manage.py migrate --run-syncdb
./run.sh & 
cd ..
npm start --prefix tfc/

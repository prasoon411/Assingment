import logging
import requests as rq
import urllib3
from bs4 import BeautifulSoup
from flask import Flask,jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
@app.route('/<query>',methods=['GET']) 
def get(query):
     return jsonify(parse_url(query))
            
def compute_prefix(p):
    m=len(p)
    pi =list(range(m))
    k=1
    l = 0
    while k < m:
        if p[k] <= p[l]:
            l = l + 1
            pi[k] = l
            k = k + 1
        else:
            if l != 0:
                l = pi[l-1]
            else:
                pi[k] = 0
                k = k + 1
    return pi

def kmp(t, p):
    n=len(t)
    m=len(p)

    pi = compute_prefix(p)
    q = 0
    i = 0
    while i < n:
        if p[q]==t[i]:
            q=q+1
            i = i + 1
        else:
            if q != 0:
                q = pi[q-1]
            else:
                i = i + 1
        if q == m:
            return 1

def foundskills(skills, para):
    found = []
    for i in skills:
        for j in para:
            match_found = 0
            match_found = kmp(j,i)
            if match_found == 1:
                found.append(i)
    return list(set(found))

def parse_url(url):
	dict = {}
	http=urllib3.PoolManager()
	wiki = 'http://arminus.talentnow.com/Careers/SubmitResume.aspx?jpc='+url
	r = http.request('GET', wiki)
	page=r.data
	soup = BeautifulSoup(page,'html.parser')
	div = soup.find('div',id='ctl00_TNCareerPortal_divJobDetails')
	table = div.find('table')
	key_skills_row = table.find_all('tr',class_='fieldRow')
	key_skills = key_skills_row[4].find('td',class_='fieldsColumn').get_text().strip().split("\n")
	key_skills = key_skills[0].split(" ")
	key_skills = list(set(key_skills))
	key_skills = [x.lower() for x in key_skills]
	skilllink = 'https://ft-goutam-bose1511.oraclecloud2.dreamfactory.com/api/v2/questionbank/_table/savsoft_category?api_key=ba3047c6a6e01f8fee570c6e6730f7a6d6dd8fb2acddfb04ddcbe669b806516d&fields=category_name'
	response = rq.get(skilllink)
	data = response.json()
	skills = ['angular','html','css','cordova','jquery','react','javascript']
	for var in data["resource"]:
		skills.append(var["category_name"].lower())
	skills = list(set(skills))
	found = foundskills(skills,key_skills)
	found = sorted(list(set(found)))
	if len(found)>=2 :
		dict['string'] = "Found a relevant skill to the job. Would you like to see some questions on "+found[0].upper()+" ?"
		dict['found'] = 'Yes'
		dict['skills'] = found[0].upper()
		return dict
	dict['string']= "Couldn't find a proper skill relevant to the job. Would you like to mention some? If yes type in the skill."
	dict['found'] = 'No'
	dict['skills'] = '0'
	return dict
	
			
                
if __name__ == '__main__':
     app.run(port=8080)

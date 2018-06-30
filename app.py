import sqlalchemy
from sqlalchemy import create_engine, inspect, func
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.expression import cast
from sqlalchemy.orm import Session, aliased
import numpy as np
import pandas as pd
from datetime import datetime
from flask import Flask, jsonify, render_template, request, flash, redirect

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite", echo=False)

Base = automap_base()

Base.prepare(engine, reflect=True)

Otu = Base.classes.otu
Samples=Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

session = Session(engine)

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/names')
def names():
   
    sampleId_result=Samples.__table__.columns.keys()
    sampleId_result.pop(0)
    return jsonify(sampleId_result)
    
@app.route('/otu')
def otu():
    Otu_result=session.query(Otu.lowest_taxonomic_unit_found).all()
    Otu_result= list(np.ravel(Otu_result))
    return jsonify(Otu_result)

@app.route('/metadata/<sample>')
def metadata(sample):
    metadata_results = session.query(Samples_metadata.AGE, Samples_metadata.BBTYPE,
        Samples_metadata.ETHNICITY,
        Samples_metadata.GENDER,
        Samples_metadata.LOCATION,
        Samples_metadata.SAMPLEID).all()
    metadata = []
    for result in metadata_results:
        metadata_dict = {}
        metadata_dict["AGE"] = result[0]
        metadata_dict["BBTYPE"] = result[1]
        metadata_dict["ETHNICITY"] = result[2]
        metadata_dict["GENDER"] = result[3]
        metadata_dict["LOCATION"] = result[4]
        metadata_dict["SAMPLEID"] = result[5]
        
        metadata.append(metadata_dict)
    
    i=0
    sample_metadata=[]
    for i in range(0,len(metadata)): 
        if sample == "BB_"+ str(metadata[i]['SAMPLEID']) :
            one_sample_metadata = metadata[i]
            sample_metadata.append(one_sample_metadata)
        else: 
            i+= 1

    return jsonify(sample_metadata[0])

@app.route('/wfreq/<sample>')
def wfreq(sample):
    WFREQ_results= session.query(Samples_metadata.SAMPLEID, Samples_metadata.WFREQ).all()
    
    WFREQ_list= []
    for result in WFREQ_results:
        row = {"SAMPLEID":"WFREQ"}
        row["SAMPLEID"] = result[0]
        row["WFREQ"] = result[1]
        WFREQ_list.append(row)
    
    i=0
    sample_WFREQ=[]
    for i in range(0,len(WFREQ_list)): 
        if sample == "BB_"+ str(WFREQ_list[i]['SAMPLEID']) :
            one_sample_WFREQ = WFREQ_list[i]
            sample_WFREQ.append(one_sample_WFREQ)
        else: 
            i+= 1
            
    return jsonify(sample_WFREQ)

@app.route('/samples/<sample>')
def samples(sample):
            
    df_data = pd.read_csv("DataSets/belly_button_biodiversity_samples.csv")
    sampleId_result=Samples.__table__.columns.keys()
    sampleId=sampleId_result.pop(0)
    
    sample_value_list=[]
    for sample_id in sampleId_result:
        sample_value_dict={}
        sample_df = df_data.sort_values(sample_id, ascending=False).fillna(0)
        otu_id= sample_df["otu_id"].tolist()
        sample_value= sample_df[sample_id].tolist()   
        sample_value_dict= {sample_id: {"otu_ids": otu_id, "sample_values": sample_value}}
        sample_value_list.append(sample_value_dict)
    
    i = 0
    onesample_value=[]
    for i in range(0,len(sample_value_list)):
        for k in list(sample_value_list[i].keys()):
            if sample == k:
                one_sample= sample_value_list[i][sample]
                onesample_value.append(one_sample)
            else: 
                i+= 1
   
    return jsonify(onesample_value)

if __name__ == "__main__":
    app.run(debug=True)

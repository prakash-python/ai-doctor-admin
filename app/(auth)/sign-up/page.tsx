"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Eye, EyeOff, Upload } from "lucide-react";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

export default function SignUpPage() {
  const [show, setShow] = useState(false);
  const [image, setImage] = useState<File|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);
  const [form,setForm]=useState<any>({});
  const [errors,setErrors]=useState<any>({});

  const validateField=(k:string,v:any)=>{
    let e="";
    if(k==="name"&&!v) e="Name required";
    if(k==="mobile"&&!/^\d{10}$/.test(v||"")) e="10 digit mobile required";
    if(k==="email"&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) e="Invalid email";
    if(k==="password"&&!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}/.test(v||""))
      e="Min 8 chars, upper, lower, number & symbol";
    if(k==="age"&&(v<1||v>120)) e="Invalid age";
    if(k==="gender"&&!v) e="Gender required";
    return e;
  };

  const set=(k:string,v:any)=>{
    setForm({...form,[k]:v});
    setErrors({...errors,[k]:validateField(k,v)});
  };

  const formValid = Object.values(errors).every(e=>!e) &&
    form.name && form.mobile && form.password && form.age && form.gender && image;

  const submit=async()=>{
    if(!formValid) return Swal.fire("Error","Fix form errors","error");

    setLoading(true);
    const fd=new FormData();
    Object.keys(form).forEach(k=>fd.append(k,form[k]));
    if(image) fd.append("profileImage",image);

    const res=await fetch("/api/auth/signup",{method:"POST",body:fd});
    setLoading(false);

    if(res.ok){
      Swal.fire("Success","Account created","success").then(()=>location.href="/sign-in");
    } else {
      const j=await res.json();
      Swal.fire("Error",j.message,"error");
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="flex justify-center items-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-3">

          <h2 className="text-2xl font-bold text-blue-700 text-center">Patient Registration</h2>

          <input className={`input ${errors.name&&"err-border"}`} placeholder="Full Name"
            onChange={e=>set("name",e.target.value)}/>
          <p className="err-text">{errors.name}</p>

          <input className={`input ${errors.mobile&&"err-border"}`} maxLength={10} placeholder="Mobile"
            onChange={e=>set("mobile",e.target.value.replace(/\D/g,""))}/>
          <p className="err-text">{errors.mobile}</p>

          <input className={`input ${errors.email&&"err-border"}`} placeholder="Email (optional)"
            onChange={e=>set("email",e.target.value)}/>
          <p className="err-text">{errors.email}</p>

          <div className="relative">
            <input type={show?"text":"password"} className={`input pr-12 ${errors.password&&"err-border"}`}
              placeholder="Password" onChange={e=>set("password",e.target.value)}/>
            <button type="button" onClick={()=>setShow(!show)} className="eye">
              {show?<EyeOff size={18}/>:<Eye size={18}/>}
            </button>
          </div>
          <p className="err-text">{errors.password}</p>

          <input className={`input ${errors.age&&"err-border"}`} type="number" placeholder="Age"
            onChange={e=>set("age",e.target.value)}/>
          <p className="err-text">{errors.age}</p>

          <select className={`input ${errors.gender&&"err-border"}`} onChange={e=>set("gender",e.target.value)}>
            <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
          </select>
          <p className="err-text">{errors.gender}</p>

          <select className="input" onChange={e=>set("bloodGroup",e.target.value)}>
            <option value="">Blood Group (optional)</option>
            {BLOOD_GROUPS.map(b=><option key={b}>{b}</option>)}
          </select>

          <div className={`border-2 border-dashed rounded-xl p-4 text-center ${!image&&"err-border"}`}>
            <label className="cursor-pointer">
              <Upload size={20}/><p className="text-sm">Upload Profile Photo</p>
              <input type="file" hidden accept="image/*"
                onChange={e=>{
                  const f=e.target.files?.[0];
                  if(f){ setImage(f); setPreview(URL.createObjectURL(f)); }
                }}/>
            </label>
            {preview && <img src={preview} className="w-20 h-20 rounded-full mx-auto mt-2 object-cover"/>}
          </div>

          <button disabled={!formValid||loading} onClick={submit}
            className="w-full py-3 bg-blue-600 text-white rounded-lg disabled:opacity-40">
            {loading?"Creating...":"Create Account"}
          </button>
        </div>
      </div>

      <div className="hidden md:flex flex-col items-center justify-center bg-blue-900 px-8">
        <img src="/hospital.jpg" className="max-h-96 mb-12 drop-shadow-2xl"/>
        <div className="text-white text-center">
          <h1 className="text-5xl font-bold">AI Doctor</h1>
          <p className="opacity-90">Smart hospital & patient care</p>
        </div>
      </div>

      <style jsx>{`
        .input{width:100%;padding:12px;border:1px solid #d1d5db;border-radius:10px}
        .err-border{border-color:#dc2626}
        .err-text{font-size:12px;color:#dc2626;height:14px}
        .eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#4b5563}
      `}</style>
    </div>
  );
}

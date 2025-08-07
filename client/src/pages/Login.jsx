import React, { useContext, useState } from 'react'
import assets from '../assets/assets.js';
import { AuthContext } from '../../context/authContext.jsx';

const Login = () => {

  const [currState, setcurrState] = useState("Sign up");
  const [Email, setEmail] = useState("")
  const [Fullname, setFullname] = useState("")
  const [Bio, setBio] = useState("")
  const [Password, setPassword] = useState("")
  const [isDatasubmitted, setisDatasubmitted] = useState(false)

  const {login} = useContext(AuthContext)

  const onSubmitHandler =(event)=>{
     event.preventDefault();
     if(currState==="Sign up" && !isDatasubmitted){
      setisDatasubmitted(true)
      return;
     }
     login(currState==="Sign up" ? "signup" :"login",{
  fullname: Fullname,
  email: Email,
  password: Password,
  bio: Bio

     })
  }

  return (
    <div className='min-h-screen bg-cover bg-center flex items-center 
justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl'>
      {/* left */}
      <img src={assets.logo_big} alt="" className='w-[min(30vw,250px)]' />

      {/* right */}
      <form onSubmit={onSubmitHandler} className='border-2 bg-white/10 text-white border-gray-500 p-6 flex 
  flex-col gap-6 rounded-lg shadow-lg'>

        <h2 className='font-medium text-2xl flex justify-between items-center'>
          {currState}
     {isDatasubmitted && <img onClick={ ()=> setisDatasubmitted(false) } src=
{assets.arrow_icon} alt="" className='w-5 cursor-pointer' />
}
        </h2>

        {currState === "Sign up" && !isDatasubmitted && (

          <input
            onChange={(e) => setFullname(e.target.value)}
            value={Fullname}
            type="text"
            placeholder="Full Name"
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none"
          />)}

        {!isDatasubmitted && (<input
          onChange={(e) => setEmail(e.target.value)}
          value={Email}
          type="email"
          placeholder="Email Address"
          required
          className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        )}

        {!isDatasubmitted && (<input
          onChange={(e) => setPassword(e.target.value)}
          value={Password}
          type="password"
          placeholder="Password"
          required
          className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        )}

{currState === "Sign up" && isDatasubmitted && (
  <>
    <textarea
      onChange={(e) => setBio(e.target.value)}
      value={Bio}
      rows={4}
      className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      placeholder="Provide a short bio..."
      required
    ></textarea>
  </>
)}

    <button
      type="submit"
      className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer"
    >
      {currState === "Sign up" ? "Create Account" : "Login Now"}
    </button>

    <div className='flex items-center gap-2 text-sm text-gray-500'>
<input type="checkbox" />
<p>Agree to the terms of use & privacy policy. </p>
</div>







<div className="flex flex-col gap-2">
  {currState === "Sign up" ? (
    <p className="text-sm text-gray-600">
      Already have an account?{" "}
      <span
        onClick={() => {
          setcurrState("Login");
          setisDatasubmitted(false);
        }}
        className="font-medium text-violet-500 cursor-pointer"
      >
        Login here
      </span>
    </p>
  ) : (
    <p className="text-sm text-gray-600">
      Create an account{" "}
      <span
        onClick={() => setcurrState("Sign up")}
        className="font-medium text-violet-500 cursor-pointer"
      >
        Click here
      </span>
    </p>
  )}
</div>



  </form>
    </div>

  )
}

export default Login

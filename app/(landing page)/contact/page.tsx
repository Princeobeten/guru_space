import React from 'react'

const page = () => {
  return (
   <div className="min-h-screen bg-gradient-to-br from-navy to-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r text-white animate-fade-in-up">
          Contact Us
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-down">
          <div className="bg-blue-800 bg-opacity-50 p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-white">Get in Touch</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-blue-200 mb-2">Name</label>
                <input type="text" id="name" name="name" className="w-full p-2 rounded bg-blue-900 text-white" />
              </div>
              <div>
                <label htmlFor="email" className="block text-blue-200 mb-2">Email</label>
                <input type="email" id="email" name="email" className="w-full p-2 rounded bg-blue-900 text-white" />
              </div>
              <div>
                <label htmlFor="message" className="block text-blue-200 mb-2">Message</label>
                <textarea id="message" name="message" rows={4} className="w-full p-2 rounded bg-blue-900 text-white"></textarea>
              </div>
              <button type="submit" className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-full hover:from-blue-500 hover:to-blue-700 transition duration-300">
                Send Message
              </button>
            </form>
          </div>

          <div className="bg-blue-800 bg-opacity-50 p-8 rounded-lg animate-fade-in-down">
            <h2 className="text-2xl font-semibold mb-4 text-white">Contact Information</h2>
            <div className="space-y-4">
              <p className="text-blue-300">
                <strong className="text-white">Address:</strong><br />
                Guru Innovation Hub<br />
                No. 74 Etta agbo, by Main gate 
              </p>
              <p className="text-blue-300">
                <strong className="text-white">Phone:</strong><br />
                +(234) 815 252 5866
              </p>
              <p className="text-blue-300">
                <strong className="text-white">Email:</strong><br />
                guruihub@gmail.com
              </p>
              <p className="text-blue-300">
                <strong className="text-white">Hours:</strong><br />
                Monday - Friday: 9am - 5pm<br />
                Saturday: special arragnment<br />
                Sunday: on special occasion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
   );
}

export default page
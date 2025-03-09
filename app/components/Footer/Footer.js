import React from 'react'

function Footer() {
    return (
        <div className='w-full flex justify-center items-center p-2 text-sm text-gray-600 '>
            <p className="text-center md:text-left">&copy; {new Date().getFullYear()} Scroll Connect. All rights reserved.</p>
        </div>
    )
}

export default Footer
import React from 'react'
import './countbubble.css'

export default ({children, className = '', size = '20px', fontSize = '10px'}) => (
    <div className={`count-bubble ${className}`} style={{width: size, height: size, fontSize}}>
        {children}
    </div>
)
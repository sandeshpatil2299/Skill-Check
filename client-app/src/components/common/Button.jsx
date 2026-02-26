import React from 'react'

const Button = ({
    children,
    onClick,
    type= 'button',
    disabled= false,
    className= "",
    variant= 'primary',
    size= 'md',
}) => {
    const baseStyle= 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap'

    const variantStyles= {
        primary: 'bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:        '
    }
    return (
        <div>Button</div>
    )
}

export default Button
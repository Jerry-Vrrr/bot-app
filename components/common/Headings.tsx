import React from 'react'

interface props {
    text: string,
    style?: string
}

export const H1 = ({text, style}: props) => {
  return (
    <h1 className={`${style} text-[32px] font-bold`}>{text}</h1>
  )
}


export const H2 = ({text, style}: props) => {
    return (
      <h2 className={`${style} text-[24px] font-bold`}>{text}</h2>
    )
  }
  
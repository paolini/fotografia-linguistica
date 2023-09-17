import React, { useState } from 'react'
import Head from 'next/head'
import { Button } from 'react-bootstrap'

import Header from '@/components/Header'
import { useMessagesState, Message } from '@/components/Messages'
import { get, value, array, remove, State } from '@/lib/State'
import { SITE_TITLE } from '@/lib/config'

export default function Page({header=true, title, children} : {
      header?: boolean
      title?: string,
      children?: React.ReactNode,
    }) {
    const messagesState = useMessagesState()

    return <>
      <Head>
        <title>{SITE_TITLE}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        { header && <Header /> }
        { title && <h1>{title}</h1> }
        <Messages messagesState={messagesState} />
        {children}
      </main>
    </>
}

function Messages({messagesState}: {messagesState: State<Message[]>}) {
  if (value(messagesState).length === 0) return null
  return <div>
    {array(messagesState).map( (messageState, i) => 
      <Message 
          key={i} 
          message={value(messageState)}
          dismiss={() => remove(messagesState, value(messageState))} 
      />)}
  </div>
}

function Message({message, dismiss}: {
    message: Message
    dismiss: () => void
}) {  
  const variant={
    info: "alert-info",
    success: "alert-success",
    error: "alert-danger",
    warning: "alert-warning",
  }[message.type]

  return <div className={`alert ${variant}`} role="alert">
    <Button className="btn-close mr-1" onClick={() => dismiss()}></Button>
    {message.message}
  </div>
}

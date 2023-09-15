import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { ClientSafeProvider, getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import authOptions from "./api/auth/[...nextauth]"
import { useSearchParams } from "next/navigation"
import { Button, Card } from "react-bootstrap"
import { useState } from "react"

import Error from '@/components/Error'
import Email from "next-auth/providers/email";

export default function SignIn({ providers, csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined
  const error = searchParams.get('error')
  const invalidCredentials = error === 'Invalid username or password'
  const querystring = callbackUrl === undefined ? '' : `?callbackUrl=${encodeURIComponent(callbackUrl)}`
  const google = Object.values(providers).find((provider) => provider.name === 'google')
  const [expanded, setExpanded] = useState(invalidCredentials)

  return <Card>
      <Card.Header>
        <Card.Title>Fotografia linguistica: autenticazione</Card.Title>
      </Card.Header>
      <Card.Body>
        {error && !invalidCredentials && <Error>{ error }</Error>}
        <EmailLogin csrfToken={csrfToken} querystring={querystring} />
        {expanded ? <>
          <hr />
          {google && <GoogleLogin provider={google} callbackUrl={callbackUrl}/>}
          <hr />
          { invalidCredentials && <Error>Username o password errati</Error>}
          <CredentialsLogin querystring={querystring} callbackUrl={callbackUrl} csrfToken={csrfToken}/>
        </> : <>
          <br className="py-2"/>
          <p><a href="#" onClick={() => setExpanded(true)}>[accedi tramite credenziali]</a></p>
        </>}
      </Card.Body>
    </Card>
}

function EmailLogin({querystring, csrfToken}: {
  querystring: string,
  csrfToken: string|undefined,
}) {
  return <form method="post" action={`/api/auth/signin/email${querystring}`}>
    <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
    <label>
        Inserisci il tuo indirizzo email
        {} <input type="email" id="email" name="email" />
    </label>
    {} <Button type="submit">Inviami Email</Button>
    <br />
    Ti invieremo un messaggio per entrare nel sito.
  </form>
}

function GoogleLogin({provider, callbackUrl}: {
  provider: ClientSafeProvider,
  callbackUrl: string|undefined,
}) {
  return <div className="py-2">
    <Button onClick={() => signIn(provider.id,{callbackUrl})}>
      Entra con un account google
    </Button>
  </div>
}

function CredentialsLogin({querystring,callbackUrl,csrfToken} : {
    querystring: string,
    callbackUrl: string|undefined,
    csrfToken: string|undefined,
  }) {
  return <form method="post" action={`/api/auth/callback/credentials${querystring}`}>
    <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
    <label>
    Username
    {} <input name="username" type="text" />
    </label>
    <br />
    <label>
    Password
    {} <input name="password" type="password" />
    </label>
    <br/>
    <Button type="submit">Entra</Button>
  </form>
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);
  
  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();
  const csrfToken = await getCsrfToken(context)

  return {
    props: { 
        providers: providers ?? [],
        csrfToken,
    },
  }
}
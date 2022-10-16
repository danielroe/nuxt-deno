import process from 'https://deno.land/std/node/process.ts'
import { serve } from 'https://deno.land/std/http/server.ts'
import { serveTls } from 'https://deno.land/std/http/server.ts'

import '#internal/nitro/virtual/polyfill'

import destr from 'destr'
import { useRuntimeConfig } from '#internal/nitro'
import { nitroApp } from '#internal/nitro/app'
import { requestHasBody, useRequestBody } from '#internal/nitro/utils'

const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3
const hostname = process.env.NITRO_HOST || process.env.HOST

if (cert && key) {
  serveTls(handler, { key, cert, port, hostname, onListen })
} else {
  serve(handler, { port, hostname, onListen })
}

function onListen({ port, hostname }) {
  const baseURL = (useRuntimeConfig().app.baseURL || '').replace(/\/$/, '')
  const url = `${hostname}:${port}${baseURL}`
  console.log(`Listening ${url}`)
}

// async function handler (request: Request, _connInfo: ConnInfo) {
async function handler(request, _connInfo) {
  const url = new URL(request.url)
  let body
  if (requestHasBody(request)) {
    body = await useRequestBody(request)
  }

  const r = await nitroApp.localCall({
    url: url.pathname + url.search,
    host: url.hostname,
    protocol: url.protocol,
    headers: request.headers,
    method: request.method,
    redirect: request.redirect,
    body,
  })

  // TODO: fix in nitro
  const responseBody = r.status !== 304 ? r.body : null
  return new Response(responseBody, {
    headers: r.headers,
    status: r.status || 200,
    statusText: r.statusText,
  })
}

if (process.env.DEBUG) {
  process.on('unhandledRejection', err =>
    console.error('[nitro] [dev] [unhandledRejection]', err)
  )
  process.on('uncaughtException', err =>
    console.error('[nitro] [dev] [uncaughtException]', err)
  )
} else {
  process.on('unhandledRejection', err =>
    console.error('[nitro] [dev] [unhandledRejection] ' + err)
  )
  process.on('uncaughtException', err =>
    console.error('[nitro] [dev] [uncaughtException] ' + err)
  )
}

export default {}

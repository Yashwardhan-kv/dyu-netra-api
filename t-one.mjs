const r = await fetch('https://api.freellma.dyunetra.dpdns.org/v1/models').catch(e => ({ err: e.cause ? e.cause.message : e.message }));
console.log(JSON.stringify(r.err ? { err: r.err } : { status: r.status }));

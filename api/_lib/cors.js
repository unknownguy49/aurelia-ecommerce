export function handleCors(request,response){
    const origin=request.headers.origin;

    const allowedOrigins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://aurelia-jewellers.vercel.app"
    ];

    if(origin&&allowedOrigins.includes(origin)){
        response.setHeader(
            "Access-Control-Allow-Origin",
            origin
        );
    }

    response.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type"
    );

    response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    response.setHeader(
        "Access-Control-Allow-Credentials",
        "true"
    );

    if(request.method==="OPTIONS"){
        response.status(204).end();
        return true;
    }

    return false;
}
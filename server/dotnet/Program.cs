using Microsoft.AspNetCore.StaticFiles.Infrastructure;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Stripe;

// Load `.env` file
DotNetEnv.Env.Load();

// For sample support and debugging, not required for production:
StripeConfiguration.AppInfo = new AppInfo
{
    Name = "stripe-samples/link-with-stripe",
    Url = "https://github.com/stripe-samples/link-with-stripe",
    Version = "0.0.1",
};

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// Setup API keys
var stripeSecretKey = builder.Configuration["STRIPE_SECRET_KEY"];
var stripePublishableKey = builder.Configuration["STRIPE_PUBLISHABLE_KEY"];
var stripeWebHookSigningSecret = builder.Configuration["STRIPE_WEBHOOK_SECRET"];

var stripeClient = new StripeClient(stripeSecretKey);
builder.Services.AddSingleton<IStripeClient>(stripeClient);
builder.Services.AddSingleton<PaymentIntentService>();

var app = builder.Build();

// Handle run-away exceptions.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

var staticFileOptions = new SharedOptions()
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), @"../../client/html")),
};
app.UseDefaultFiles(new DefaultFilesOptions(staticFileOptions));
app.UseStaticFiles(new StaticFileOptions(staticFileOptions));

app.MapGet("config", async () =>
{
    return Results.Ok(new { publishableKey = stripePublishableKey });
});

app.MapPost("create-payment-intent", async (PaymentIntentService service, ILogger<Program> logger) =>
{
  try
  {
    var options = new PaymentIntentCreateOptions
    {
      Amount = 1000,
      Currency = "usd",
      // Best practice is to enable Link through the dashboard
      // and use automatic payment methods. For this demo,
      // we explicitly pass payment_method_types: ['link', 'card'],
      // to be extra clear which payment method types are enabled.
      //
      //   AutomaticPaymentMethods = new() { Enabled: true },
      AutomaticPaymentMethods = new()
      {
        Enabled = true,
      },
      // PaymentMethodTypes = new List<string> { "link", "card" },
    };
    var paymentIntent = await service.CreateAsync(options);
    return Results.Ok(new { clientSecret = paymentIntent.ClientSecret });
  }
  catch (StripeException e)
  {
    logger.LogError(e, "Error creating PaymentIntent");
    return Results.BadRequest(new { error = new { message = e.StripeError.Message } });
  }
});

app.MapGet("/payment/next", async (PaymentIntentService service, ILogger<Program> logger) =>
{
  try
  {
    var options = new PaymentIntentGetOptions();
    options.AddExpand("payment_method");
    var paymentIntent = await service.GetAsync(options);
    if(paymentIntent.PaymentMethod.Link.PersistentToken) {
        var cookie = new CookieHeaderValue(
            "stripe.link.persistent_token",
            paymentIntent.PaymentMethod.Link.PersistentToken);
        cookie.Expires = DateTimeOffset.Now.AddDays(90);
        cookie.Domain = Request.RequestUri.Host;
        cookie.Path = "/";
        resp.Headers.AddCookies(new CookieHeaderValue[] { cookie });
    }
    return Results.Redirect($"/success?payment_intent_client_secret={paymentIntent.ClientSecret}");
  }
  catch (StripeException e)
  {
    logger.LogError(e, "Error creating PaymentIntent");
    return Results.BadRequest(new { error = new { message = e.StripeError.Message } });
  }
});

app.MapPost("webhook", async (HttpRequest req) =>
{
    var json = await new StreamReader(req.Body).ReadToEndAsync();
    Event stripeEvent;
    try
    {
        stripeEvent = EventUtility.ConstructEvent(
            json,
            req.Headers["Stripe-Signature"],
            stripeWebHookSigningSecret
        );
        app.Logger.LogInformation($"Webhook notification with type: {stripeEvent.Type} found for {stripeEvent.Id}");
    }
    catch (Exception e)
    {
        app.Logger.LogError(e, $"Something failed => {e.Message}");
        return Results.BadRequest();
    }

    if (stripeEvent.Type == Events.PaymentIntentSucceeded)
    {
        var paymentIntent = stripeEvent.Data.Object as Stripe.PaymentIntent;
        app.Logger.LogInformation($"PaymentIntent ID: {paymentIntent.Id}");
    }

    return Results.Ok();
});

app.Run("http://localhost:4242");

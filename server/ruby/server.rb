# frozen_string_literal: true

require 'stripe'
require 'sinatra'
require 'sinatra/cookies'
require 'dotenv'

# Replace if using a different env file or config
Dotenv.load

# For sample support and debugging, not required for production:
Stripe.set_app_info(
  'stripe-samples/link',
  version: '0.0.1',
  url: 'https://github.com/stripe-samples/link'
)
Stripe.api_key = ENV['STRIPE_SECRET_KEY']
LINK_PERSISTENT_TOKEN_COOKIE_NAME = 'stripe.link.persistent_token'

set :static, true
set :public_folder, File.join(File.dirname(__FILE__), ENV['STATIC_DIR'])
set :port, 4242

get '/' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'index.html')
end

get '/config' do
  content_type 'application/json'
  {
    publishableKey: ENV['STRIPE_PUBLISHABLE_KEY'],
  }.to_json
end

post '/create-payment-intent' do
  content_type 'application/json'
  data = JSON.parse(request.body.read)

  # Create the payment details based on your logic.
  # Create a PaymentIntent with the purchase amount and currency.
  payment_intent = Stripe::PaymentIntent.create(
    amount: 1000,
    currency: 'usd',

    # Best practice is to enable Link through the dashboard
    # and use automatic payment methods. For this demo,
    # we explicitly pass payment_method_types: ['link', 'card'],
    # to be extra clear which payment method types are enabled.
    #
    #   automatic_payment_methods: { enabled: true },
    #
    payment_method_types: ['link', 'card'],

    # Optionally, include the link persistent token for the cookied
    # Link session.
    payment_method_options: {
      link: {
        persistent_token: cookies[LINK_PERSISTENT_TOKEN_COOKIE_NAME],
      }
    }
  )

  # Send the PaymentIntent client_secret to the client.
  {
    clientSecret: payment_intent.client_secret
  }.to_json
end

get '/payment/next' do
  content_type 'text/html'

  intent = Stripe::PaymentIntent.retrieve({
    id: params[:payment_intent],
    expand: ['payment_method'],
  })

  if intent.status == 'succeeded' || intent.status == 'processing'
    begin
      # Set the cookie to the persistent token of the Link session.
      # This will ensure the customer can avoid logging in again next time
      # if they are in the same session.
      link_persistent_token = intent.payment_method.link.persistent_token
      if !link_persistent_token.nil?
        response.set_cookie(
          LINK_PERSISTENT_TOKEN_COOKIE_NAME,
          {
            value: link_persistent_token,
            same_site: :strict,
            secure: true,
            httponly: true,
            expires: Time.now + (60 * 60 * 24 * 90), # 90 days from now.
          }
        )
      end
    rescue NoMethodError => e
      puts "No method error #{e.message}"
    end
  end

  redirect "/success?payment_intent_client_secret=#{intent.client_secret}"
end

get '/success' do
  content_type 'text/html'
  send_file File.join(settings.public_folder, 'success.html')
end

post '/webhook' do
  # You can use webhooks to receive information about asynchronous payment events.
  # For more about our webhook events check out https://stripe.com/docs/webhooks.
  webhook_secret = ENV['STRIPE_WEBHOOK_SECRET']
  payload = request.body.read
  if !webhook_secret.empty?
    # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    event = nil

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, webhook_secret
      )
    rescue JSON::ParserError => e
      # Invalid payload
      status 400
      return
    rescue Stripe::SignatureVerificationError => e
      # Invalid signature
      puts '⚠️  Webhook signature verification failed.'
      status 400
      return
    end
  else
    data = JSON.parse(payload, symbolize_names: true)
    event = Stripe::Event.construct_from(data)
  end

  case event.type
  when 'some.event'
    puts '🔔  Webhook received!'
  end

  content_type 'application/json'
  {
    status: 'success'
  }.to_json
end

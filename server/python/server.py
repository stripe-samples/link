#! /usr/bin/env python3.6
import datetime
import stripe
import json
import os

from flask import Flask, render_template, jsonify, request, send_from_directory, make_response, redirect
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

LINK_PERSISTENT_TOKEN_COOKIE_NAME = 'stripe.link.persistent_token'

# For sample support and debugging, not required for production:
stripe.set_app_info(
    'stripe-samples/link',
    version='0.0.1',
    url='https://github.com/stripe-samples/link')

stripe.api_version = '2020-08-27;link_beta=v1'
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

static_dir = str(
    os.path.abspath(os.path.join(__file__ , "..", os.getenv("STATIC_DIR"))))
print(static_dir)
app = Flask(__name__, static_folder=static_dir, static_url_path="", template_folder=static_dir)

@app.route('/', methods=['GET'])
def get_root():
    return render_template('index.html')


@app.route('/config', methods=['GET'])
def get_config():
    return jsonify({'publishableKey': os.getenv('STRIPE_PUBLISHABLE_KEY')})


@app.route('/create-payment-intent', methods=['POST'])
def create_payment():
    # Create a PaymentIntent with the amount, currency, and a payment method type.
    #
    # See the documentation [0] for the full list of supported parameters.
    #
    # [0] https://stripe.com/docs/api/payment_intents/create
    try:
        intent = stripe.PaymentIntent.create(
            amount=1999,
            currency='usd',

            # Best practice is to enable Link through the dashboard
            # and use automatic payment methods. For this demo,
            # we explicitly pass payment_method_types: ['link', 'card'],
            # to be extra clear which payment method types are enabled.
            #
            #   automatic_payment_methods={ 'enabled': True },
            #
            payment_method_types=['link', 'card'],

            # Optionally, include the link persistent token for the cookied
            # Link session.
            payment_method_options={
                'link': {
                    'persistent_token': request.cookies.get(LINK_PERSISTENT_TOKEN_COOKIE_NAME),
                }
            })

        # Send PaymentIntent details to the front end.
        return jsonify({'clientSecret': intent.client_secret})
    except stripe.error.StripeError as e:
        return jsonify({'error': {'message': str(e)}}), 400
    except Exception as e:
        return jsonify({'error': {'message': str(e)}}), 400


@app.route('/payment/next', methods=['GET'])
def payment_next():
    intent = stripe.PaymentIntent.retrieve(
        request.args.get('payment_intent'),
        expand=['payment_method'])

    if intent.status == 'succeeded' or intent.status == 'processing':
        try:
            link_persistent_token = intent.payment_method.link.persistent_token
        except:
            link_persistent_token = None

    response = make_response(
        redirect('/success?payment_intent_client_secret={}'.format(intent.client_secret)))

    if link_persistent_token is not None:
        # Set the cookie from the value returned on the PaymentIntent.
        response.set_cookie(
            LINK_PERSISTENT_TOKEN_COOKIE_NAME,
            link_persistent_token,
            samesite='Strict',
            secure=True,
            httponly=True,
            expires=datetime.datetime.now() + datetime.timedelta(days=90))

    return response


@app.route('/success', methods=['GET'])
def get_success():
    return render_template('success.html')


@app.route('/webhook', methods=['POST'])
def webhook_received():
    # You can use webhooks to receive information about asynchronous payment events.
    # For more about our webhook events check out https://stripe.com/docs/webhooks.
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    request_data = json.loads(request.data)

    if webhook_secret:
        # Retrieve the event by verifying the signature using the raw body and secret if webhook signing is configured.
        signature = request.headers.get('stripe-signature')
        try:
            event = stripe.Webhook.construct_event(
                payload=request.data, sig_header=signature, secret=webhook_secret)
            data = event['data']
        except Exception as e:
            return e
        # Get the type of webhook event sent - used to check the status of PaymentIntents.
        event_type = event['type']
    else:
        data = request_data['data']
        event_type = request_data['type']
    data_object = data['object']

    if event_type == 'payment_intent.succeeded':
        print('💰 Payment received!')


    return jsonify({'status': 'success'})


if __name__ == '__main__':
    app.run(port=4242, debug=True)

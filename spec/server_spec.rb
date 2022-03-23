require_relative './spec_helper.rb'

RSpec.describe "<your integration name> integration" do
  it "serves the index route" do
    # Get the index html page
    response = get("/")
    expect(response).not_to be_nil
  end

  it "serves config with publishableKey" do
    resp = get_json("/config")
    expect(resp).to have_key("publishableKey")
    expect(resp['publishableKey']).to start_with("pk_test")
  end

  it "Creates a payment intent" do
    resp, status = post_json("/create-payment-intent", {})
    expect(status).to eq(200)
    expect(resp).to have_key("clientSecret")
    expect(resp["clientSecret"]).to start_with("pi_")
    client_secret = resp["clientSecret"]
    pi = Stripe::PaymentIntent.retrieve(client_secret.split("_secret").first)
    expect(pi.payment_method_types).to eq(['link', 'card'])
  end
end

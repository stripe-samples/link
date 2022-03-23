require 'capybara_support'

RSpec.describe 'PaymentElement', type: :system do
  before do
    visit server_url('/')
  end

  example 'happy path' do
    within_frame first('form iframe[title*="Secure email input frame"]') do
      fill_in 'email', with: "test#{SecureRandom.hex(4)}@example.com"
    end

    within_frame first('form iframe[title*="Shipping address input frame"]') do
      fill_in 'Field-nameInput', with: "jenny rosen"
      fill_in 'addressLine1', with: "123 Main St"
      fill_in 'locality', with: "San Francisco"
      fill_in 'Field-postalCodeInput', with: "94111"
      select 'California', from: 'Field-administrativeAreaInput'
    end

    within_frame first('form iframe[title*="Secure payment input frame"]') do
      fill_in 'number', with: '4242424242424242'
      fill_in 'expiry', with: '12 / 33'
      fill_in 'cvc', with: '123'
      fill_in 'postalCode', with: '10000'
    end

    click_on 'Pay'

    expect(page).to have_no_content('Pay now')
    expect(page).to have_content('Success!')
    expect(page).to have_content('Payment Intent Status: succeeded')
  end
end

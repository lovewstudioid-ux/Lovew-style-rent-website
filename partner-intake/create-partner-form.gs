/**
 * LOVEW Style — Partner Onboarding Form generator
 *
 * Builds a Google Form for collecting a dress-rental partner's BUSINESS details
 * (pickup address, contact, payout info). The dress catalog itself is collected
 * via the separate "Partner Catalog" Google Sheet, not this form.
 *
 * HOW TO USE (one time, ~1 minute):
 *   1. Go to https://script.google.com  →  New project
 *   2. Delete the sample code, paste this whole file in
 *   3. Click Run  →  authorise when prompted (it's your own account)
 *   4. Open the Executions / Logs — it prints the Form's edit + share URLs
 *   5. In the Form, turn on "Collect responses" and share the *published* link
 *      with partners. Responses auto-collect into a linked Google Sheet.
 *
 * Re-run any time to create a fresh copy.
 */
function createLovewPartnerForm() {
  const form = FormApp.create('LOVEW Style — Partner Onboarding')
    .setTitle('LOVEW Style — Partner Onboarding')
    .setDescription(
      'Thank you for partnering with LOVEW Style. This short form captures your ' +
      'business details so we can list your pieces and arrange pickups. Your dress ' +
      'catalog is collected separately in the Catalog spreadsheet we share with you.'
    )
    .setCollectEmail(true)
    .setProgressBar(true);

  const req = (item) => item.setRequired(true);

  req(form.addTextItem().setTitle('Brand / business name'));
  req(form.addTextItem().setTitle('Owner / main contact name'));
  req(form.addTextItem()
    .setTitle('WhatsApp number')
    .setHelpText('Format starting 62, e.g. 6281234567890'));
  form.addTextItem().setTitle('Instagram (optional)').setHelpText('e.g. https://instagram.com/yourbrand');

  req(form.addMultipleChoiceItem()
    .setTitle('City')
    .setChoiceValues(['Jakarta', 'Surabaya', 'Bali', 'Bandung']));

  req(form.addParagraphTextItem()
    .setTitle('Pickup address (full)')
    .setHelpText('Where customers / couriers collect the dress.'));
  req(form.addTextItem().setTitle('Area / district').setHelpText('e.g. Kebayoran Baru, Jakarta Selatan'));

  req(form.addMultipleChoiceItem()
    .setTitle('Do you offer in-store pickup?')
    .setChoiceValues(['Yes', 'No']));
  req(form.addMultipleChoiceItem()
    .setTitle('Do you offer delivery / shipping?')
    .setChoiceValues(['Yes', 'No']));
  form.addTextItem()
    .setTitle('If you deliver, which areas?')
    .setHelpText('e.g. Jaksel, Jakpus, Tangsel');

  form.addTextItem().setTitle('Operating hours').setHelpText('e.g. Mon–Sat 10:00–19:00');

  // Payout details (kept together)
  form.addSectionHeaderItem()
    .setTitle('Payout details')
    .setHelpText('Where LOVEW sends your earnings. Kept private.');
  req(form.addTextItem().setTitle('Bank name').setHelpText('e.g. BCA'));
  req(form.addTextItem().setTitle('Account number'));
  req(form.addTextItem().setTitle('Account holder name'));

  // Optional storefront image. (File-upload questions require respondents to be
  // signed into a Google account; remove this item if that's a barrier.)
  form.addImageItem; // no-op guard for older runtimes
  try {
    form.addFileUploadItem()
      .setTitle('Storefront or logo photo (optional)')
      .setHelpText('One image is plenty.');
  } catch (e) {
    // file-upload not available in this context — skip silently
  }

  form.addParagraphTextItem().setTitle('Anything else we should know? (optional)');

  // Link responses to a fresh spreadsheet for easy review.
  const ss = SpreadsheetApp.create('LOVEW Style — Partner Onboarding (Responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log('FORM (edit):     ' + form.getEditUrl());
  Logger.log('FORM (share):    ' + form.getPublishedUrl());
  Logger.log('RESPONSES SHEET: ' + ss.getUrl());
}

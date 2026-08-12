export type EmailCategory =
  | 'business-development'
  | 'sales'
  | 'projects'
  | 'customer-support'
  | 'administration'
  | 'resources';

export interface EmailSegment {
  id: string;
  label: string;
  focusLine: string;
  servicesFocus: string[];
}

export interface EmailTemplate {
  id: string;
  category: EmailCategory;
  name: string;
  purpose: string;
  subjects: string[];
  body: string;
  cta?: string;
  attachmentHint?: string;
  fields?: string[];
  segments?: EmailSegment[];
}

export const EMAIL_CATEGORIES: { id: EmailCategory; label: string }[] = [
  { id: 'business-development', label: 'Business Development' },
  { id: 'sales', label: 'Sales' },
  { id: 'projects', label: 'Projects' },
  { id: 'customer-support', label: 'Customer Support' },
  { id: 'administration', label: 'Administration' },
  { id: 'resources', label: 'Resources' },
];

export const STANDARD_SIGNATURE = `[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
Powering Industry. Delivering Value.

📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com
📍 Lagos, Nigeria

Industrial Engineering | Equipment Supply | Maintenance | Repairs | Technical Support`;

export const CTA_LIBRARY = [
  'Explore our solutions: www.samidakservices.com',
  'Request a quotation: www.samidakservices.com',
  'Please find our Company Profile attached for your review.',
  'We would be happy to schedule a meeting at your convenience.',
  'Kindly share your technical requirements so our engineering team can review them.',
];

export const SUBJECT_LIBRARY = [
  'Introducing SAMIDAK | Industrial Engineering Solutions',
  'Quotation – [Product/Service] | [Reference]',
  'Follow-Up: [Requirement/Quotation]',
  'Maintenance Reminder – [Equipment]',
  'Project Update – [Project Name]',
  'Meeting Request – SAMIDAK & [Company]',
  'Partnership Opportunity – SAMIDAK & [Company]',
];

const INTRO_SEGMENTS: EmailSegment[] = [
  {
    id: 'manufacturing',
    label: 'Manufacturing',
    focusLine:
      'We support manufacturing operations with compressed air reliability, preventive maintenance, spare parts, and solutions that reduce production downtime.',
    servicesFocus: [
      'Compressed air systems',
      'Preventive maintenance',
      'Spare parts supply',
      'Production uptime support',
    ],
  },
  {
    id: 'oil-gas',
    label: 'Oil & Gas',
    focusLine:
      'We support oil & gas operations with industrial equipment, compressors, valves, pumps, maintenance, and responsive technical project support.',
    servicesFocus: [
      'Industrial equipment',
      'Compressors, valves & pumps',
      'Maintenance & technical support',
      'Project requirements support',
    ],
  },
  {
    id: 'food-beverage',
    label: 'Food & Beverage',
    focusLine:
      'We support food & beverage plants with compressed air systems, filtration, equipment maintenance, reliability, and production uptime.',
    servicesFocus: [
      'Compressed air & filtration',
      'Equipment maintenance',
      'Reliability programmes',
      'Production uptime',
    ],
  },
  {
    id: 'construction',
    label: 'Construction',
    focusLine:
      'We support construction and site operations with compressors, industrial equipment, pumps, technical support, and equipment servicing.',
    servicesFocus: [
      'Compressors',
      'Industrial equipment & pumps',
      'Technical support',
      'Equipment servicing',
    ],
  },
  {
    id: 'pharmaceutical',
    label: 'Pharmaceutical',
    focusLine:
      'We support pharmaceutical operations with compressed air, filtration, maintenance, reliability, and equipment support.',
    servicesFocus: [
      'Compressed air & filtration',
      'Maintenance',
      'Reliability',
      'Equipment support',
    ],
  },
  {
    id: 'engineering-procurement',
    label: 'Engineering / Procurement',
    focusLine:
      'We support engineering and procurement teams with equipment sourcing, spare parts, technical support, installation, commissioning, and project delivery.',
    servicesFocus: [
      'Equipment sourcing',
      'Spare parts',
      'Installation & commissioning',
      'Project support',
    ],
  },
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'company-introduction',
    category: 'business-development',
    name: 'Company Introduction (Cold Outreach)',
    purpose:
      'First point of contact with a company that does not yet know SAMIDAK. Introduce the company, create interest, and drive the recipient to the Company Profile or a quotation request.',
    subjects: [
      'Introducing SAMIDAK Technical and Allied Services Nigeria Limited',
      'Reliable Industrial Engineering & Equipment Solutions for Your Business',
      'Industrial Engineering & Equipment Solutions | SAMIDAK',
    ],
    fields: ['recipientName', 'senderName', 'jobTitle', 'company'],
    segments: INTRO_SEGMENTS,
    attachmentHint: 'SAMIDAK_Company_Profile_2026.pdf',
    cta: 'Want to learn more about SAMIDAK?\nView our attached Company Profile.\n\nNeed a product or service?\nRequest a Quote at www.samidakservices.com',
    body: `Dear [Recipient's Name],

Greetings from SAMIDAK Technical and Allied Services Nigeria Limited.

We are an industrial engineering company based in Nigeria, providing reliable equipment, technical services, maintenance, repairs, and engineering support to help businesses keep their operations running efficiently.

[SEGMENT_FOCUS]

Our services include:
• Pressurized Air Compressors & Compressed Air Systems
• Industrial Equipment Supply
• Equipment Installation & Commissioning
• Preventive & Corrective Maintenance
• Equipment Repairs & Servicing
• Spare Parts Supply
• Pumps, Motors, Valves & Industrial Components
• Hydraulic & Pneumatic Systems
• Technical Engineering Support

At SAMIDAK, our focus is to help businesses reduce equipment downtime, improve reliability, and maintain efficient operations through quality products and professional technical support.

We are reaching out to introduce our company and make our services available to your organization for your current and future equipment, maintenance, engineering, and procurement needs.

We have attached our Company Profile for your review. It provides more information about our company, services, products, technical capabilities, and the industries we serve.

You can also visit our website to learn more about SAMIDAK, explore our products and services, and submit a request for quotation:
www.samidakservices.com

If your organization has an upcoming project, equipment requirement, maintenance need, or procurement request, we would be happy to discuss your requirements and provide the appropriate support.

Thank you for your time and consideration. We look forward to the opportunity to work with your organization.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com
📍 Lagos, Nigeria

Attachment: SAMIDAK Company Profile.pdf`,
  },
  {
    id: 'concise-outreach',
    category: 'business-development',
    name: 'Quick Company Introduction',
    purpose: 'Shorter version for busy executives, procurement officers, and high-volume outreach (~150–180 words).',
    subjects: ['Reliable Industrial Engineering Solutions for Your Business'],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Company_Profile_2026.pdf',
    body: `Dear [Name],

Greetings from SAMIDAK Technical and Allied Services Nigeria Limited.

We are an industrial engineering company dedicated to providing reliable, efficient, and professional solutions that help businesses maximize productivity and reduce equipment downtime.

Our expertise includes:
• Pressurized Air Compressor Systems
• Industrial Equipment Supply
• Installation & Commissioning
• Maintenance & Repair Services
• Genuine Spare Parts
• Technical Engineering Support

Attached is our Company Profile, which provides an overview of our services, products, industries served, and technical capabilities.

We would be delighted to discuss how SAMIDAK can support your operations. Visit www.samidakservices.com to learn more or request a quote.

Thank you for your time, and we look forward to working with you.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com
📍 Lagos, Nigeria`,
  },
  {
    id: 'company-profile-sharing',
    category: 'business-development',
    name: 'Company Profile Sharing',
    purpose: 'When someone requests information about SAMIDAK or you are sharing the profile proactively.',
    subjects: [
      'SAMIDAK Company Profile – Industrial Engineering Solutions',
      'Company Profile Attached – SAMIDAK Technical & Allied Services',
    ],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Company_Profile_2026.pdf',
    body: `Dear [Recipient's Name],

Thank you for your interest in SAMIDAK Technical and Allied Services Nigeria Limited.

Please find attached our Company Profile for your review. Inside you will find:
• Company Overview
• Engineering Services
• Product Portfolio
• Industries We Serve
• Technical Capabilities
• Our Engineering Process
• Why Businesses Choose SAMIDAK

You can also explore our solutions and request a quotation at:
www.samidakservices.com

We would appreciate the opportunity to discuss how our solutions can support your operations. Please feel free to share any current requirements or schedule a brief discussion at your convenience.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'product-catalogue',
    category: 'business-development',
    name: 'Product Catalogue Sharing',
    purpose: 'When sending product or equipment information to a customer.',
    subjects: [
      'Product Information – [Product/Equipment] | SAMIDAK',
      'Catalogue Attached – [Product/Equipment]',
    ],
    fields: ['recipientName', 'product', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Product_Catalogue_[Product].pdf',
    cta: 'Send Requirements → Receive Recommendation → Request Quote',
    body: `Dear [Recipient's Name],

Thank you for your interest in [Product/Equipment].

Please find attached the relevant product information/catalogue for your review.

If you can share your required capacity, specification, quantity, application or any available technical details, our team can recommend the appropriate solution and prepare a quotation.

You may also submit a quote request at www.samidakservices.com.

We remain available to assist.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'partnership-introduction',
    category: 'business-development',
    name: 'Partnership / Manufacturer Introduction',
    purpose:
      'Introduce SAMIDAK to manufacturers, OEMs, brands, and distributors seeking reliable market and technical support in Nigeria.',
    subjects: [
      'Partnership Opportunity – SAMIDAK & [Company]',
      'Exploring Collaboration – SAMIDAK Technical & Allied Services',
    ],
    fields: ['recipientName', 'company', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Company_Profile_2026.pdf',
    body: `Dear [Recipient's Name],

Greetings from SAMIDAK Technical and Allied Services Nigeria Limited.

We are an industrial engineering company based in Lagos, Nigeria, providing equipment supply, installation, commissioning, maintenance, repairs, spare parts, and technical support to industrial customers.

We are interested in exploring opportunities to support your brand and products within the Nigerian industrial market.

SAMIDAK brings:
• Engineering capability and field technical support
• Market knowledge across manufacturing and industrial sectors
• An expanding customer network
• After-sales and maintenance capability
• Professional communication and digital presence via www.samidakservices.com

We would welcome a conversation on how we can collaborate as a reliable technical and market partner in Nigeria.

Please find our Company Profile attached for your review.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'profile-followup-1',
    category: 'business-development',
    name: 'Profile Follow-Up 1 (2–3 days)',
    purpose: 'First follow-up after sharing the Company Profile.',
    subjects: ['Following Up – SAMIDAK Company Profile', 'Did you have a chance to review our Company Profile?'],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    body: `Dear [Name],

I hope you are doing well.

I wanted to follow up regarding the Company Profile we shared recently.

Did you have the opportunity to review it? We would be happy to clarify any questions or discuss how SAMIDAK can support your equipment, maintenance, or engineering needs.

You can also visit www.samidakservices.com for more information or to request a quotation.

We look forward to hearing from you.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'profile-followup-2',
    category: 'business-development',
    name: 'Profile Follow-Up 2 (5–7 days)',
    purpose: 'Second follow-up focused on current requirements.',
    subjects: ['Following Up – SAMIDAK Engineering Solutions', 'How can SAMIDAK support your operations?'],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    body: `Dear [Name],

I hope this message finds you well.

I am following up to ask whether you have any current equipment, maintenance, or project requirements we can assist with.

At SAMIDAK, we are ready to support your organization with professional engineering solutions tailored to your operational needs—including compressed air systems, equipment supply, installation, maintenance, and spare parts.

If it would be helpful, we can schedule a brief call or meeting at your convenience.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'profile-followup-3',
    category: 'business-development',
    name: 'Profile Follow-Up 3 (10–14 days)',
    purpose: 'Polite closing follow-up leaving the door open for future needs.',
    subjects: ['Remaining Available – SAMIDAK Technical Support', 'SAMIDAK – Available for Future Requirements'],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    body: `Dear [Name],

I hope you are well.

I wanted to close the loop politely and confirm that SAMIDAK remains available for any future equipment, maintenance, engineering, or procurement requirements.

Whenever the need arises, you can reach us at info@samidakservices.com or visit www.samidakservices.com to request a quotation.

Thank you again for your time and consideration.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'inbound-inquiry',
    category: 'sales',
    name: 'Response to Inbound Inquiry',
    purpose: 'Respond to an inquiry from website quote request, email, WhatsApp, or phone.',
    subjects: ['Re: Your Inquiry', 'Re: Your Request – SAMIDAK Technical & Allied Services'],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Company_Profile_2026.pdf',
    body: `Dear [Customer Name],

Thank you for contacting SAMIDAK Technical and Allied Services Nigeria Limited.

We appreciate your interest in our products and services.

Our team is currently reviewing your request, and we will provide the most suitable solution based on your requirements.

For your convenience, we have attached our Company Profile, which contains detailed information about our engineering services, product offerings, technical capabilities, and the industries we serve.

If you have any drawings, specifications, equipment details, or additional project information, kindly share them with us so we can prepare an accurate recommendation and quotation.

Thank you for considering SAMIDAK. We look forward to serving you.

Kind regards,
Customer Support Team
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'request-more-info',
    category: 'sales',
    name: 'Request for More Information',
    purpose: 'Use when the customer sends an incomplete request.',
    subjects: ['Additional Information Required – Your Inquiry', 'Re: Requirements Needed for Quotation'],
    fields: ['recipientName', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

Thank you for contacting SAMIDAK.

To help us provide the correct solution and quotation, kindly provide the following information:

• Equipment/product required
• Quantity
• Required specification/capacity
• Application
• Delivery location
• Expected delivery timeline
• Any available technical drawing/specification

Once received, our team will review the requirement and respond accordingly.

You may also submit details via www.samidakservices.com.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'quotation-submission',
    category: 'sales',
    name: 'Quotation Submission',
    purpose: 'Send a formal quotation after reviewing customer requirements.',
    subjects: ['Quotation for [Product/Service] – SAMIDAK', 'Quotation – [Product/Service] | [Reference]'],
    fields: ['recipientName', 'product', 'reference', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Quotation_[Customer]_[Ref].pdf',
    body: `Dear [Recipient's Name],

Thank you for the opportunity to support your requirement for [Product/Service].

Please find attached our quotation (Reference: [Reference]) for your review.

The quotation outlines the proposed solution, pricing, and commercial terms. Kindly note the validity period stated in the document.

If you have any questions, require adjustments, or need clarification, please let us know—we will be happy to assist.

Next step: Kindly confirm acceptance or share any feedback so we can proceed.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'quotation-followup',
    category: 'sales',
    name: 'Quotation Follow-Up',
    purpose: 'Short, respectful follow-up on a sent quotation.',
    subjects: ['Follow-Up on Quotation – [Reference]', 'Follow-Up: [Requirement/Quotation]'],
    fields: ['recipientName', 'product', 'reference', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

We are following up on the quotation sent regarding [Product/Service] (Reference: [Reference]).

Please let us know if you have had the opportunity to review it or if there are any questions, adjustments or additional information required.

We remain available to assist.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'proposal-submission',
    category: 'sales',
    name: 'Proposal Submission',
    purpose: 'For larger engineering projects requiring a formal proposal.',
    subjects: ['Technical Proposal – [Project Name] | SAMIDAK', 'Proposal Submission – [Project Name]'],
    fields: ['recipientName', 'projectName', 'reference', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Technical_Proposal_[Project].pdf',
    body: `Dear [Recipient's Name],

Please find attached our technical proposal for [Project Name] (Reference: [Reference]).

The proposal covers:
• Project scope
• Proposed approach and engineering solution
• Commercial summary
• Timeline considerations
• Supporting documentation

We would welcome the opportunity to discuss the proposal and address any questions.

Kindly confirm receipt and let us know a convenient time for review.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'tender-procurement',
    category: 'sales',
    name: 'Tender / Procurement Opportunity',
    purpose: 'Formal expression of interest for tenders and procurement opportunities.',
    subjects: [
      'Expression of Interest – [Project/Tender]',
      'SAMIDAK Submission – [Tender/Procurement Reference]',
    ],
    fields: ['recipientName', 'projectName', 'reference', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Company_Profile_2026.pdf + relevant bid documents',
    body: `Dear [Recipient's Name],

On behalf of SAMIDAK Technical and Allied Services Nigeria Limited, we hereby express our interest in [Project Name] (Reference: [Reference]).

SAMIDAK provides industrial engineering solutions including equipment supply, installation and commissioning, maintenance, repairs, spare parts, and technical support across multiple industrial sectors.

Please find attached our Company Profile and the required supporting documents for your consideration.

We would appreciate confirmation of receipt and guidance on the next steps in your procurement process.

Yours faithfully,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com
RC: 6891936`,
  },
  {
    id: 'meeting-request',
    category: 'projects',
    name: 'Meeting Request',
    purpose: 'Request a meeting with procurement, engineering, factory, or partner contacts.',
    subjects: [
      'Meeting Request – SAMIDAK Technical & Allied Services',
      'Meeting Request – SAMIDAK & [Company]',
    ],
    fields: ['recipientName', 'company', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

I hope this message finds you well.

We would appreciate the opportunity to schedule a brief meeting at a convenient time to understand [Company]'s current and future equipment, maintenance, and engineering requirements.

SAMIDAK Technical and Allied Services Nigeria Limited provides industrial engineering solutions including compressed air systems, equipment supply, installation, commissioning, maintenance, and technical support.

Please let us know a suitable date and time, or suggest an alternative that works for your team.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'site-inspection',
    category: 'projects',
    name: 'Site Inspection Request',
    purpose: 'Request access for a site visit to assess requirements accurately.',
    subjects: ['Site Inspection Request – [Project Name]', 'Request for Site Access – SAMIDAK'],
    fields: ['recipientName', 'projectName', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

Further to your requirement regarding [Project Name], we request a site inspection to enable our engineering team to assess conditions accurately and recommend the appropriate solution.

Proposed visit details:
• Proposed date: [Proposed Date]
• Purpose: Engineering assessment and requirement confirmation
• Personnel: SAMIDAK technical team
• Access required: Site / equipment / relevant contact person

Kindly confirm a suitable date and any access or safety requirements we should prepare for.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'project-update',
    category: 'projects',
    name: 'Project Update',
    purpose: 'Provide transparent progress updates during active projects.',
    subjects: ['Project Update – [Project Name]', 'Status Update – [Project Name]'],
    fields: ['recipientName', 'projectName', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

Please find below an update on [Project Name]:

Project: [Project Name]
Current Stage: [Current Stage]
Completed: [Completed Work]
In Progress: [Work In Progress]
Next Step: [Next Work]
Expected Timeline: [Timeline]

Please let us know if you require any clarification or additional information.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'project-handover',
    category: 'projects',
    name: 'Project Completion / Handover',
    purpose: 'Communicate project completion, handover, and after-sales support.',
    subjects: ['Project Completion – [Project Name]', 'Handover Confirmation – [Project Name]'],
    fields: ['recipientName', 'projectName', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

We are pleased to confirm the successful completion of [Project Name].

Summary:
• Work completed as agreed
• Testing and commissioning carried out
• Documentation prepared for handover
• Customer verification requested
• After-sales support available

Please confirm receipt of the handover package. Our team remains available for training, maintenance, and ongoing technical support.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'maintenance-reminder',
    category: 'customer-support',
    name: 'Maintenance Reminder',
    purpose: 'Remind customers of scheduled preventive maintenance.',
    subjects: ['Maintenance Reminder – [Equipment]', 'Scheduled Maintenance Due – [Equipment]'],
    fields: ['recipientName', 'equipment', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

This is a friendly reminder that your [Equipment] is due for its scheduled maintenance.

Regular maintenance helps reduce unexpected breakdowns, improve equipment performance and extend equipment life.

Please let us know a suitable date for the maintenance visit.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'service-completion',
    category: 'customer-support',
    name: 'Service Completion',
    purpose: 'Confirm completed service work and recommendations.',
    subjects: ['Service Completion Report – [Equipment]', 'Service Completed – [Equipment]'],
    fields: ['recipientName', 'equipment', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

This is to confirm that service has been completed on [Equipment].

Service summary:
• Equipment: [Equipment]
• Work performed: [Work Performed]
• Findings: [Findings]
• Recommendations: [Recommendations]
• Next maintenance date: [Next Maintenance Date]
• Engineer: [Engineer Name]

Kindly confirm that the work meets your expectations. We remain available for any follow-up support.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'complaint-response',
    category: 'customer-support',
    name: 'Customer Complaint / Issue Response',
    purpose: 'Acknowledge and professionally respond to a complaint or issue—never defensive.',
    subjects: ['Re: Your Concern – SAMIDAK Support', 'Update on Your Reported Issue'],
    fields: ['recipientName', 'reference', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

Thank you for bringing this matter to our attention (Reference: [Reference]).

We acknowledge your concern and apologize for any inconvenience caused. We take all customer feedback seriously and are reviewing the issue carefully.

Our team is taking the following action:
• Confirming the details of the reported issue
• Assigning the appropriate technical/support resource
• Working toward a timely resolution

We will update you within [Timeline] with progress and next steps.

Thank you for your patience and for giving us the opportunity to make this right.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'customer-thankyou',
    category: 'customer-support',
    name: 'Customer Thank-You',
    purpose: 'Strengthen relationships after a meeting, project, purchase, site visit, or successful service.',
    subjects: ['Thank You – SAMIDAK Technical & Allied Services', 'Appreciation – Working with [Company]'],
    fields: ['recipientName', 'company', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

Thank you for the opportunity to work with [Company].

We appreciate your trust in SAMIDAK Technical and Allied Services Nigeria Limited and remain committed to delivering reliable industrial engineering support.

If you need further assistance with equipment, maintenance, spare parts, or technical support, please do not hesitate to contact us.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'customer-onboarding',
    category: 'customer-support',
    name: 'Customer Onboarding',
    purpose: 'Welcome a new customer after winning an order or project.',
    subjects: ['Welcome to SAMIDAK – Onboarding', 'Onboarding Confirmation – [Reference]'],
    fields: ['recipientName', 'reference', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

Welcome to SAMIDAK Technical and Allied Services Nigeria Limited.

We are pleased to begin working with you. Below are your onboarding details:

• Primary contact: [Full Name] – [Job Title]
• Communication channels: info@samidakservices.com | +234 816 236 8769
• Project/Order reference: [Reference]
• Next steps: [Next Steps]
• Required documents (if any): [Required Documents]

Our team is ready to support a smooth and professional engagement. Please feel free to reach out with any questions.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'invoice-submission',
    category: 'administration',
    name: 'Invoice Submission',
    purpose: 'Send an invoice with clear payment instructions.',
    subjects: ['Invoice – [Project/Order Reference]', 'Invoice [Reference] – SAMIDAK'],
    fields: ['recipientName', 'reference', 'amount', 'senderName', 'jobTitle'],
    attachmentHint: 'SAMIDAK_Invoice_[Invoice Number].pdf',
    body: `Dear [Recipient's Name],

Please find attached Invoice [Reference] for [Project/Order Reference].

Invoice details:
• Invoice number: [Reference]
• Amount: [Amount]
• Due date: [Due Date]
• Payment instructions: As stated on the invoice / company bank details

Kindly confirm receipt. Please let us know if any additional documentation is required.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'payment-followup',
    category: 'administration',
    name: 'Payment Follow-Up',
    purpose: 'Professional, non-aggressive follow-up on outstanding payment.',
    subjects: ['Payment Follow-Up – Invoice [Reference]', 'Kind Reminder – Outstanding Payment [Reference]'],
    fields: ['recipientName', 'reference', 'amount', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

We are writing to kindly follow up regarding the outstanding payment for Invoice [Reference] ([Amount]).

Please let us know if the payment has been processed or if any additional documentation is required from our end.

Thank you for your attention to this matter.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'appointment-confirmation',
    category: 'administration',
    name: 'Appointment Confirmation',
    purpose: 'Confirm meetings, site visits, or scheduled appointments.',
    subjects: ['Appointment Confirmation – [Project Name]', 'Confirmed Meeting – SAMIDAK & [Company]'],
    fields: ['recipientName', 'company', 'projectName', 'senderName', 'jobTitle'],
    body: `Dear [Recipient's Name],

This email confirms our appointment regarding [Project Name] with [Company].

Confirmed details:
• Date/Time: [Proposed Date]
• Location / Mode: [Location]
• Agenda: Discussion of requirements and next steps
• SAMIDAK attendees: [Full Name]

Please reply if any changes are required. We look forward to speaking with you.

Kind regards,
[Full Name]
[Job Title]
SAMIDAK Technical and Allied Services Nigeria Limited
📧 info@samidakservices.com
📞 +234 816 236 8769  |  +234 807 827 8498
🌐 www.samidakservices.com`,
  },
  {
    id: 'standard-signature',
    category: 'resources',
    name: 'Standard Email Signature',
    purpose: 'Consistent professional signature for every outgoing email.',
    subjects: ['(Use with any email)'],
    fields: ['senderName', 'jobTitle'],
    body: STANDARD_SIGNATURE,
  },
];

export type MergeFields = Record<string, string>;

export function applyMergeFields(text: string, fields: MergeFields): string {
  const map: Record<string, string> = {
    "[Recipient's Name]": fields.recipientName || '[Recipient\'s Name]',
    '[Name]': fields.recipientName || '[Name]',
    '[Customer Name]': fields.recipientName || '[Customer Name]',
    '[Full Name]': fields.senderName || '[Full Name]',
    '[Job Title]': fields.jobTitle || '[Job Title]',
    '[Company]': fields.company || '[Company]',
    '[Product/Equipment]': fields.product || '[Product/Equipment]',
    '[Product/Service]': fields.product || '[Product/Service]',
    '[Reference]': fields.reference || '[Reference]',
    '[Project Name]': fields.projectName || '[Project Name]',
    '[Project/Order Reference]': fields.reference || fields.projectName || '[Project/Order Reference]',
    '[Equipment]': fields.equipment || '[Equipment]',
    '[Amount]': fields.amount || '[Amount]',
    '[Due Date]': fields.dueDate || '[Due Date]',
    '[Proposed Date]': fields.proposedDate || '[Proposed Date]',
    '[Current Stage]': fields.currentStage || '[Current Stage]',
    '[Completed Work]': fields.completedWork || '[Completed Work]',
    '[Work In Progress]': fields.workInProgress || '[Work In Progress]',
    '[Next Work]': fields.nextWork || '[Next Work]',
    '[Timeline]': fields.timeline || '[Timeline]',
    '[Work Performed]': fields.workPerformed || '[Work Performed]',
    '[Findings]': fields.findings || '[Findings]',
    '[Recommendations]': fields.recommendations || '[Recommendations]',
    '[Next Maintenance Date]': fields.nextMaintenanceDate || '[Next Maintenance Date]',
    '[Engineer Name]': fields.engineerName || '[Engineer Name]',
    '[Next Steps]': fields.nextSteps || '[Next Steps]',
    '[Required Documents]': fields.requiredDocuments || '[Required Documents]',
    '[Location]': fields.location || '[Location]',
    '[SEGMENT_FOCUS]': fields.segmentFocus || '',
  };

  let result = text;
  for (const [token, value] of Object.entries(map)) {
    result = result.split(token).join(value);
  }
  // Clean empty segment placeholder lines
  result = result.replace(/\n{3,}/g, '\n\n');
  return result;
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

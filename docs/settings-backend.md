# Settings Backend Contract

This frontend expects a backend settings API for company profile and communication credentials.

## Schema changes

Update the `companies` table and ORM model with:

```sql
ALTER TABLE companies ADD COLUMN email TEXT;
ALTER TABLE companies ADD COLUMN phone TEXT;
ALTER TABLE companies ADD COLUMN sms_api_key TEXT;
ALTER TABLE companies ADD COLUMN whatsapp_api_key TEXT;
ALTER TABLE companies ADD COLUMN email_api_key TEXT;
```

Expected ORM fields:

- `name`
- `email`
- `phone`
- `sms_api_key`
- `whatsapp_api_key`
- `email_api_key`

## Required endpoints

### `GET /settings/company`

Returns the current user's company settings object.

### `PUT /settings/company`

Accepts:

```json
{
  "name": "NitiForge",
  "email": "ops@nitiforge.com",
  "phone": "+91 99999 99999",
  "sms_api_key": "msg91-key",
  "whatsapp_api_key": "wa-key",
  "email_api_key": "sendgrid-key"
}
```

Returns:

```json
{
  "message": "Settings updated"
}
```

## Communication service usage

Messaging services should resolve keys per company:

```python
company = db.query(Company).filter(Company.id == current_user.company_id).first()
sms_key = company.sms_api_key
headers = {"authkey": company.sms_api_key}
```

If no API key is configured, communication services should return a clear validation error so the frontend can prompt the user to configure keys in Settings.

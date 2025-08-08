import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';


export const LemoreWelcomeEmail = ({ username }: { username: string }) => {
  const previewText = `Welcome to Lemore : ${username}`;

  return (
    <Html>
      <Head />

      <Body style={main}>
        <Preview>{previewText}</Preview>
        <Container style={container}>
          <Section style={{ paddingBottom: '20px' }}>
            <Row>
              <Text style={heading}>Welcome to Lemore : {username}</Text>
              <Text style={paragraph}>
                Thank you for signing up for Lemore.
              </Text>
              <Text style={{ ...paragraph, paddingBottom: '16px' }}>
                We're excited to have you on board.
              </Text>

              <Button style={button} href="https://lemore.life">
                Go to Lemore
              </Button>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section>
            <Row>
              <Text style={{ ...paragraph, fontWeight: '700' }}>
                Common questions
              </Text>
              <Text>
                What is Let Go Buddy and how does it work?
              </Text>
              <Text style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Let Go Buddy is our AI-powered decluttering assistant that analyzes photos of your items and provides personalized recommendations on whether to sell, donate, or keep them based on your situation.
              </Text>

              <Text>
                  How do I start selling or giving away items?
              </Text>
              <Text style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Simply upload photos of your items, add descriptions, and choose to sell or give away for free. Our community-focused platform makes it easy to connect with local buyers and people in need.
              </Text>

              <Text>
                What is the Challenge Calendar?
              </Text>
              <Text style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                Each day brings a simple challenge to help you let go of clutter, uncover what’s meaningful, and enjoy a lighter, more intentional lifestyle.
              </Text>
              <Hr style={hr} />
            </Row>
          </Section>

          <Section>
            <Row>
              <Text style={footer}>
                By using Lemore, you agree to our{' '}
                <Link href="https://lemore.life/terms-of-service" style={footerLink}>
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="https://lemore.life/privacy-policy" style={footerLink}>
                  Privacy Policy
                </Link>
                .
              </Text>
              <Text style={footer}>
                © 2025 Lemore. All rights reserved.
              </Text>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};


export default LemoreWelcomeEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  maxWidth: '100%',
};

const userImage = {
  margin: '0 auto',
  marginBottom: '16px',
  borderRadius: '50%',
};

const heading = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#3A4D1F',
};

const paragraph = {
  fontSize: '18px',
  lineHeight: '1.4',
  color: '#484848',
};

const review = {
  ...paragraph,
  padding: '24px',
  backgroundColor: '#f2f3f3',
  borderRadius: '4px',
};

const button = {
  backgroundColor: '#dae079',
  borderRadius: '3px',
  color: '#3A4D1F',
  fontSize: '18px',
  padding: '19px 30px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
};

const link = {
  ...paragraph,
  color: '#7A8B3F',
  display: 'block',
};

const reportLink = {
  fontSize: '14px',
  color: '#9ca299',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#cccccc',
  margin: '20px 0',
};

const footer = {
  color: '#9ca299',
  fontSize: '14px',
  marginBottom: '10px',
};

const footerLink = {
  color: '#7A8B3F',
  textDecoration: 'underline',
};

const logo = {
  display: 'block',
  margin: '0 auto 24px auto',
};

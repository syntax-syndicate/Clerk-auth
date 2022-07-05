import { PhoneNumberResource } from '@clerk/types';
import React from 'react';

import { useCoreUser } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { Badge, Col } from '../customizables';
import { AccordionItem, FormattedPhoneNumber, useCardState } from '../elements';
import { handleError } from '../utils';
import { LinkButtonWithDescription } from './LinkButtonWithDescription';
import { ProfileSection } from './Section';
import { AddBlockButton } from './UserProfileBlockButtons';
import { primaryIdentificationFirst } from './utils';

export const PhoneSection = () => {
  const user = useCoreUser();
  const { navigate } = useNavigate();

  return (
    <ProfileSection
      title='Phone numbers'
      id='phoneNumbers'
    >
      {user.phoneNumbers.sort(primaryIdentificationFirst(user.primaryPhoneNumberId)).map(phone => (
        <PhoneAccordion
          key={phone.id}
          phone={phone}
        />
      ))}

      <AddBlockButton onClick={() => navigate('phone-number')}>Add a phone number</AddBlockButton>
    </ProfileSection>
  );
};

const PhoneAccordion = ({ phone }: { phone: PhoneNumberResource }) => {
  const card = useCardState();
  const user = useCoreUser();
  const { navigate } = useNavigate();
  const isPrimary = user.primaryPhoneNumberId === phone.id;
  const isVerified = phone.verification.status === 'verified';
  const remove = () => phone.destroy();
  const setPrimary = () => {
    return user.update({ primaryPhoneNumberId: phone.id }).catch(e => handleError(e, [], card.setError));
  };

  return (
    <AccordionItem title={<FormattedPhoneNumber value={phone.phoneNumber} />}>
      <Col gap={4}>
        {isPrimary && (
          <LinkButtonWithDescription
            title='Primary phone number'
            titleLabel={<Badge>Primary</Badge>}
            subtitle='This phone number is the primary phone number'
          />
        )}
        {!isPrimary && isVerified && (
          <LinkButtonWithDescription
            title='Primary phone number'
            subtitle='Set this phone number as the primary to receive communications regarding your account.'
            actionLabel='Set as primary'
            onClick={setPrimary}
          />
        )}
        {!isPrimary && !isVerified && (
          <LinkButtonWithDescription
            title='Unverified phone number'
            titleLabel={<Badge colorScheme='warning'>Unverified</Badge>}
            subtitle='This phone number has not been verified and may be limited in functionality'
            actionLabel='Complete verification'
            onClick={() => navigate(`phone-number/${phone.id}`)}
          />
        )}
        <LinkButtonWithDescription
          title='Remove'
          subtitle='Delete this phone number and remove it from your account'
          actionLabel='Remove phone number'
          colorScheme='danger'
          onClick={remove}
        />
      </Col>
    </AccordionItem>
  );
};

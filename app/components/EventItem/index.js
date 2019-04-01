// @flow

import React from 'react';
import styles from './styles.css';
import Pill from 'app/components/Pill';
import { colorForEvent } from 'app/routes/events/utils';
import { Link } from 'react-router';
import { Image } from 'app/components/Image';
import Time from 'app/components/Time';
import Tag from 'app/components/Tags/Tag';
import { Flex } from 'app/components/Layout';
import type { Event, EventTimeType } from 'app/models';
import { EVENTFIELDS } from 'app/utils/constants';
import { eventStatus, eventAttendance } from 'app/utils/eventStatus';

type AttendanceProps = {
  event: Event
};

const Attendance = ({ event }: AttendanceProps) => {
  const attendance = eventAttendance(event);
  return (
    attendance && (
      <Pill style={{ marginLeft: '5px', color: 'black', whiteSpace: 'nowrap' }}>
        {attendance}
      </Pill>
    )
  );
};

type TimeStampProps = {
  event: Event,
  field: EventTimeType
};

const TimeStamp = ({ event, field }: TimeStampProps) => {
  const registration = eventStatus(event, true);
  return (
    <div className={styles.eventTime}>
      {registration && (
        <span>
          {registration}
          <br />
        </span>
      )}
      Starter <Time time={event.startTime} format="ll - HH:mm" />
    </div>
  );
};

type EventItemProps = {
  event: Event,
  field?: EventTimeType,
  showTags?: boolean
};

const EventItem = ({
  event,
  field = EVENTFIELDS.start,
  showTags = true
}: EventItemProps) => (
  <div
    style={{ borderColor: colorForEvent(event.eventType) }}
    className={styles.eventItem}
  >
    <div>
      <Link to={`/events/${event.id}`}>
        <h3 className={styles.eventItemTitle}>{event.title}</h3>
        {event.totalCapacity > 0 && (
          <Attendance
            registrationCount={event.registrationCount}
            totalCapacity={event.totalCapacity}
            event={event}
          />
        )}
      </Link>
      <TimeStamp event={event} field={field} />
      {showTags && (
        <Flex wrap>
          {event.tags.map((tag, index) => (
            <Tag key={index} tag={tag} small />
          ))}
        </Flex>
      )}
    </div>

    <div className={styles.companyLogo}>
      {event.cover && <Image src={event.cover} />}
    </div>
  </div>
);

export default EventItem;

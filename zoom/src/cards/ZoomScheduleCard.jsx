import React from 'react';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {
	Button,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Tooltip,
	Typography
} from '@ellucian/react-design-system/core';
import { Icon } from '@ellucian/ds-icons/lib';
import classNames from 'classnames';
import { withStyles } from '@ellucian/react-design-system/core/styles';
import { spacing10, spacing40 } from '@ellucian/react-design-system/core/styles/tokens';
import { ExtensionProvider, useCardInfo } from '@ellucian/experience-extension-hooks';

const styles = () => ({
	card: {
		marginLeft: spacing40,
		marginRight: spacing40,
		paddingTop: spacing10
	},
	text: {
		marginRight: spacing40,
		marginLeft: spacing40,
		paddingTop: spacing10
	}
});

const ZoomScheduleCard = (props) => {
	const {
		data: {
			getExtensionJwt
		},
		cardControl: {
			setLoadingStatus,
			setErrorMessage
		},
		classes
	} = props;
	const [user, setUser] = useState(null);
	const [schedule, setSchedule] = useState([]);
	const { cardId, configuration } = useCardInfo();

	const apiCall = async (path) => {
		const token = await getExtensionJwt();
		const resp = await fetch(`${configuration['cardhelper-url']}/api/${path}`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}
		});
		if ([200, 404].indexOf(resp.status) == -1) {
			throw new Error('Error retrieving user information from server.');
		}
		return resp;
	};

	useEffect(async () => {
		setLoadingStatus(true);
		try {
			const userResp = await apiCall('connectors/zoom/user');
			if (userResp.status == 404) {
				setLoadingStatus(false);
				return;
			}
			const userRespData = await userResp.json();
			setUser(userRespData.data);
			const scheduleResp = await apiCall('connectors/zoom/user/schedule');
			if (scheduleResp.status == 404) {
				setLoadingStatus(false);
				return;
			}
			const scheduleRespData = await scheduleResp.json();
			setSchedule(scheduleRespData.data.meetings);
			setLoadingStatus(false);
		}
		catch (e) {
			setErrorMessage(e.message);
		}
	}, [true]);

	return (
		<div className={classes.card}>
			{user && (
				<>
					<Typography align="center" gutterBottom={true}>
						<Typography variant="h2" gutterBottom={true}>{user.email}</Typography>
						<Tooltip title="Go directly to your personal meeting room and start a meeting.">
							<Button href={user.personal_meeting_url} target="_blank" rel="noreferrer">Instant Meeting</Button>
						</Tooltip>
						<Typography variant="body3" gutterBottom={true}>URL: {user.personal_meeting_url}</Typography>
					</Typography>
					<Typography gutterBottom={true} variant="h4">Upcoming Meetings:</Typography>
					{schedule.length == 0 && (
						<Typography align="center" gutterBottom={true}>No upcoming meetings scheduled.</Typography>
					)}
					{schedule.length > 0 && (
						<List>
							{schedule.map((meeting) => (
							<ListItem key={meeting.id}>
								<ListItemIcon>
									<Icon
										name="calendar"
										large
									/>
								</ListItemIcon>
								<ListItemText
									primary={meeting.topic}
									secondary={moment(meeting.start_time).format('MM/DD h:mm a') + ' (' + meeting.duration + ' min.)'}
								/>
								<Button href={meeting.join_url} target="_blank" rel="noreferrer">Join</Button>
							</ListItem>
							))}
						</List>
					)}
				</>
			)}
			{!user && (
				<Typography align="center">No zoom user found. <a href="https://eckerd.zoom.us/signin" target="_blank" rel="noreferrer">Sign up</a> using your eckerd.edu email address.</Typography>
			)}
		</div>
	);
}

ZoomScheduleCard.propTypes = {
	data: PropTypes.object.isRequired,
	cardControl: PropTypes.object.isRequired,
	classes: PropTypes.object.isRequired
};
const ZoomScheduleCardWithStyles = withStyles(styles)(ZoomScheduleCard);

export default function ZoomScheduleCardWithProviders(props) {
	return (
		<ExtensionProvider {...props}>
			<ZoomScheduleCardWithStyles {...props} />
		</ExtensionProvider>
	)
}
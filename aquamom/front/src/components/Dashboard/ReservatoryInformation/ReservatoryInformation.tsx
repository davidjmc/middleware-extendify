import {
  ActionIcon,
  Center,
  Divider,
  Flex,
  Grid,
  Group,
  Menu,
  Paper,
  Progress,
  RingProgress,
  Text,
  Title,
  Tooltip,
  rem,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BsThreeDotsVertical, BsTrash } from 'react-icons/bs';
import { MdEdit } from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import useDevice from '../../../services/useDevice';

interface ReservatoryInformationProps {
  handleOpenModal: () => void;
  id: string;
  name: string;
  mac: string;
  address: string;
  maxCapacity: string;
  height: string;
  baseRadius: string;
  water: string;
  remainingDays: number;
  dailyConsumption: number;
}

export const ReservatoryInformation = ({
  handleOpenModal,
  id,
  address,
  baseRadius,
  height,
  mac,
  maxCapacity,
  name,
  water,
  remainingDays,
  dailyConsumption,
}: ReservatoryInformationProps) => {
  const { deleteDevice } = useDevice();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const ringColor = (value: number) => {
    if (value < 25) {
      return 'green';
    }

    if (value > 25 && value < 75) {
      return 'yellow';
    }

    return 'red';
  };

  const handleDelete = (id: string) => {
    deleteDevice(id)
      .then(() => {
        queryClient.invalidateQueries('allDevices').then(() => {
          notifications.show({
            color: 'green',
            title: 'Success',
            message: 'Device removed successfully',
          });
          navigate('/');
        });
      })
      .catch((error) => {
        console.log({ error });
        notifications.show({
          color: 'red',
          title: 'Error',
          message: error.message,
        });
      });
  };

  return (
    <Paper
      shadow="xl"
      p="xl"
      style={{ minHeight: '300px', minWidth: '400px', maxWidth: '500px' }}
    >
      <Group w={'100%'} position="apart">
        <Title order={3} color="#EF4B3B">
          Reservatory Information
        </Title>
        <Menu position="bottom-start" withArrow arrowSize={10}>
          <Menu.Target>
            <ActionIcon
              variant="filled"
              style={{ backgroundColor: '#1A2F48' }}
              data-testid="options-button"
            >
              <BsThreeDotsVertical />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              icon={<MdEdit size={rem(18)} />}
              onClick={() => handleOpenModal()}
              data-testid="edit-button"
            >
              Edit
            </Menu.Item>

            <Menu.Divider />
            <Menu.Label>Danger zone</Menu.Label>

            <Menu.Item
              icon={<BsTrash size={rem(18)} />}
              color="red"
              onClick={() => handleDelete(id)}
              data-testid="delete-button"
            >
              Delete Device
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Divider mt="md" mb="md" />
      <Grid>
        <Grid.Col span={6}>
          <Group spacing={'xs'}>
            <Title order={5}>Device Name:</Title>
            <Text color="dimmend">{name}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group spacing="sm">
            <Title order={5}>Mac:</Title>
            <Text color="dimmend">{mac}</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Group spacing={'xs'}>
            <Title order={5}>Address:</Title>
            <Text color="dimmend">{address}</Text>
          </Group>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={6}>
          <Group spacing={'xs'}>
            <Title order={5}>Height:</Title>
            <Text color="dimmend">{height} m</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group spacing={'xs'}>
            <Title order={5}>Base Radius:</Title>
            <Text color="dimmend">{baseRadius} m</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group spacing={'xs'}>
            <Title order={5}>Current Volume:</Title>
            <Text color="dimmend">{water} L</Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Group spacing={'xs'}>
            <Title order={5}>Max Volume:</Title>
            <Text size="md" color="dimmend">
              {maxCapacity} L
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={12}>
          <Tooltip label={'É considerado um consumo diario de 100L'}>
            <Group spacing={'xs'}>
              <Title order={5}>Remaining Supply:</Title>
              <Text size="md" color="dimmend">
                {remainingDays} Days
              </Text>
            </Group>
          </Tooltip>
        </Grid.Col>
        <Grid.Col span={12}>
          <Tooltip label={'A daily consumption of 100L is considered'}>
            <Group spacing={'xs'}>
              <Title order={5}>Daily Consumption:</Title>
              <Text size="md" color="dimmend">
                {dailyConsumption} L
              </Text>
              <RingProgress
                size={30}
                sections={[
                  {
                    value: 500,
                    color: ringColor(dailyConsumption),
                  },
                ]}
              />
            </Group>
          </Tooltip>
        </Grid.Col>
      </Grid>
    </Paper>
  );
};

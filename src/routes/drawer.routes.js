/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-unstable-nested-components */
import { createDrawerNavigator } from '@react-navigation/drawer';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Home from './home.routes';
import Churrascos from '../screens/Meus Churrascos/index';
import Receitas from '../screens/Receitas/Home/index';
import Convite from '../screens/Convite/index';
import Precos from '../screens/Preços/index';
import colors from '../colors';
import CustomStackNavigator from '../components/CustomHeader';
import BackButton from '../components/Buttons/BackButton';
import CustomDrawerContent from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();

export default function DrawerRoute() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation, route }) => {
        return {
          drawerPosition: 'right',
          initialRouteName: 'Home',
          drawerLabelStyle: {
            fontFamily: 'Lalezar_400Regular',
            fontSize: 16,
            marginLeft: -20
          },
          drawerActiveBackgroundColor: colors.focusPrimary,
          drawerActiveTintColor: colors.primary,
          headerTitle: () => {
            return (
              <CustomStackNavigator navigation={navigation} route={route} />
            );
          },
          headerLeft: () => {
            return <BackButton navigation={navigation} route={route} />;
          },
          headerStyle: {
            backgroundColor: colors.primary
          },
          headerShadowVisible: false
        };
      }}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{
          drawerIcon: () => (
            <MaterialCommunityIcons
              name="grill-outline"
              size={30}
              color={colors.primary}
            />
          ),
          headerShown: false
        }}
      />
      <Drawer.Screen
        name="Meus churrascos"
        component={Churrascos}
        options={{
          drawerIcon: () => (
            <MaterialIcons name="list-alt" size={30} color={colors.primary} />
          )
        }}
      />
      <Drawer.Screen
        name="Receitas"
        component={Receitas}
        options={{
          drawerIcon: () => (
            <MaterialIcons name="restaurant" size={30} color={colors.primary} />
          )
        }}
      />
      <Drawer.Screen
        name="Criar convite"
        component={Convite}
        options={{
          drawerIcon: () => (
            <MaterialIcons name="mail" size={30} color={colors.primary} />
          )
        }}
      />
      <Drawer.Screen
        name="Configurar preços"
        component={Precos}
        options={{
          drawerIcon: () => (
            <MaterialIcons
              name="monetization-on"
              size={30}
              color={colors.primary}
            />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

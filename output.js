import {View, Text} from 'react-native';
import {
    NavigationContainer,
    useNavigation,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useFlippers} from './flippers';

function HomeScreen() {
    const {isNewNavigate} = useFlippers(['arcadia_is_new_navigate']);
    const navigation = useNavigation();
    
    const onSubmit = async () => {
        if (isNewNavigate) {
            navigation.navigate('SettingsNew');
        } else {
            navigation.navigate('Settings');
        }
    };
    
    return (
        <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Text>Home Screen</Text>
            <View onPress={onSubmit}>
            <Text>Submit</Text>
        </View>
        </View>
    );
}

const Stack = createNativeStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
            <Stack.Screen name="Home" component={HomeScreen}/>
        </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;

import React, { useEffect, useContext, useState, useRef } from "react";

import {
  Dimensions,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SvgXml } from "react-native-svg";

//Services
import { LocationContext } from "../../../services/location/location.context";
import { getAddress, getPlaceDetail } from "../../../services/maps/address";

//Components
import { dropsList } from "./component/DropsList";
import ExpoStatusBar from "expo-status-bar/build/ExpoStatusBar";
import { Loading } from "../../../components/Loading";
import { Text } from "../../../components/typography/text.component";
import { DropPreview } from "./component/dropPreview";
import { SearchContainer, TextContainer } from "./map.screen.styles";
import { SlideView } from "../../../components/animations/slide.animation";
import { PlaceSearchBox } from "./component/PlaceSearchBox";

//assets
import { PlaceBox } from "./component/placeBox";
import { PlaceBoxBlank } from "./component/placeBoxBlank";
import { UpperBox } from "./component/upperBox";
import StartButton from "../../../../assets/Buttons/StartButton";

export const MapScreen = ({ navigation, route }) => {
  //////////////////////////지도 및 화면비율 정의///////////////////////////////////
  const map = useRef(null);

  ////////////////////////////초기 state들//////////////////////////////////////

  /////1. 모드들

  const [dropViewMode, setDropViewMode] = useState(false);
  const showModal = () => {
    setDropViewMode(true);
  };
  const [writeMode, setWriteMode] = useState(false);
  const [isDetail, setIsDetail] = useState(false);
  const [activePolygon, setActivePolygon] = useState(null);
  const [activePolygonName, setActivePolygonName] = useState(null);

  /////2. 초기 데이터셋팅
  //------------현위치
  const { location, isLoading } = useContext(LocationContext);
  //------------현재 영역
  //화면비
  let { width, height } = Dimensions.get("window");
  const ASPECT_RATIO = width / height;
  const LATITUDE_DELTA = 0.008; //Very high zoom level
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

  const [currentRegion, updateRegion] = useState({
    latitude: location[0],
    longitude: location[1],
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  const [rectNW, setRectNW] = useState("1,1");
  const [rectSE, setRectSE] = useState("0,0");
  useEffect(() => {
    const NWLat = currentRegion.latitude + currentRegion.latitudeDelta;
    const NWLng = currentRegion.longitude + currentRegion.longitudeDelta;
    const SELat = currentRegion.latitude - currentRegion.latitudeDelta;
    const SELng = currentRegion.longitude - currentRegion.longitudeDelta;
    setRectNW(`${NWLng},${NWLat}`);
    setRectSE(`${SELng},${SELat}`);
  }, [currentRegion, writeMode]);
  //---------------장소선택
  const [pressedLocation, setPressedLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [Markers, setMarkers] = useState([
    {
      latitude: Number(location[0]),
      longitude: Number(location[1]),
    },
  ]);

  useEffect(() => {
    setMarkers([
      {
        latitude: pressedLocation.latitude,
        longitude: pressedLocation.longitude,
      },
    ]);
  }, [pressedLocation]);

  /////드롭다운로드
  //개별 드롭
  const [drop, setDrop] = useState(null);
  const [dropTime, setDropTime] = useState(null);
  const [dropContent, setDropContent] = useState(null);

  //다운로드 받아진 드롭리스트
  //service로 옮기기.
  const [drops, setDrops] = useState([
    {
      emoji: "😀",
      content: "좌참살",
      createdAt: "2022-01-29T04:55:47.000Z",
      latitude: 37.585069,
      longitude: 127.029191,
      pk: 22,
      updatedAt: "2022-01-29T04:55:47.472Z",
    },
    {
      emoji: "😀",
      content: "우참살",
      createdAt: "2022-01-29T04:55:47.000Z",
      latitude: 37.585069,
      longitude: 127.029691,
      pk: 33,
      updatedAt: "2022-01-29T04:55:47.472Z",
    },
  ]);

  // 선택한 장소의 이름/주소/좌표들어가는 것
  const [pressedAddressID, setPressedAddressID] = useState("");
  const [pressedAddress, setPressedAddress] = useState("");
  const [pressedAddressName, setPressedAddressName] = useState("새로운 장소");

  ////////////////여기서부터 useEffect 정의하기 시작/////////////////////////

  //새로운  장소정보 가져오는 함수
  useEffect(() => {
    getAddress(pressedLocation, setPressedAddressID);
    getPlaceDetail(setPressedAddress, setPressedAddressName, pressedAddressID);

    console.log("longclicked");
  }, [pressedAddressID, pressedLocation]);

  /////----writePage에서 다시 되돌아올 때 초기화면으로
  useEffect(() => {
    setWriteMode(false);
  }, [route.params]);

  //////////정해진 장소정보 가져오는 함수

  const allCoords = drops.map((i) => ({
    geometry: {
      coordinates: [i.latitude, i.longitude],
    },
  }));

  useEffect(() => {
    console.log(activePolygon);
  }, [activePolygon]);

  /////////맵그리는 것 여기서부터 시작///////

  return isLoading ? (
    <Loading />
  ) : (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView>
        <View>
          {/*----------------------- 맨 상단 컴포넌트--------------------------- */}
          <SearchContainer>
            {UpperBox(activePolygon, activePolygonName, setActivePolygon)}
            <TextContainer>
              {activePolygon != null ? (
                <>
                  <Text variant="hint">
                    {activePolygonName} 구역을 검색해보세요
                  </Text>
                </>
              ) : (
                <Text variant="hint">구역을 선택해주세요</Text>
              )}
            </TextContainer>
          </SearchContainer>

          {/*----------------------- 지도 컴포넌트--------------------------- */}
          <View>
            {dropsList(
              drops,
              setPressedLocation,
              setMarkers,
              setPressedAddress,
              setPressedAddressName,
              location,
              map,
              LATITUDE_DELTA,
              LONGITUDE_DELTA,
              writeMode,
              Markers,
              allCoords,
              currentRegion,
              updateRegion,
              showModal,
              setWriteMode,
              setDropContent,
              setDrop,
              setDropTime,
              activePolygon,
              setActivePolygon,
              activePolygonName,
              setActivePolygonName
            )}
          </View>
          {/*----------------------- 맨 하단 컴포넌트--------------------------- */}
          {!writeMode && !dropViewMode && activePolygon == null ? (
            <>
              {PlaceBoxBlank(
                setWriteMode,
                setPressedLocation,
                location,
                map,
                LATITUDE_DELTA,
                LONGITUDE_DELTA
              )}
            </>
          ) : writeMode ? (
            <>
              {PlaceBox(
                setWriteMode,
                pressedAddressName,
                pressedAddress,
                navigation,
                pressedLocation
              )}
            </>
          ) : dropViewMode ? (
            <>
              <TouchableWithoutFeedback onPress={() => {}}>
                {/* <SlideView isDetail={isDetail}> 안드로이드에서 문제가 생기는 이유*/}
                <DropPreview
                  pressedAddress={pressedAddress}
                  pressedAddressName={pressedAddressName}
                  dropContent={dropContent}
                  pressedLocation={pressedLocation}
                  navigation={navigation}
                  drop={drop}
                  dropTime={dropTime}
                  isDetail={isDetail}
                  setIsDetail={setIsDetail}
                />
                {/* </SlideView> */}
              </TouchableWithoutFeedback>
            </>
          ) : (
            <>
              {/* 여기에 polygon 클릭 후 나타나는 컴포넌트 배치. */}
              <PlaceSearchBox></PlaceSearchBox>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

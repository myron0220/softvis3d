/*
 * SoftViz3d Sonar plugin
 * Copyright (C) 2013 Stefan Rinderle
 * stefan@rinderle.info
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02
 */
package de.rinderle.softviz3d.layout.calc.topdown;

import att.grappa.Graph;
import att.grappa.GrappaBox;
import de.rinderle.softviz3d.grappa.GrappaGraphFactory;
import de.rinderle.softviz3d.tree.ResourceTreeService;
import junit.framework.TestCase;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AbsolutePositionCalculatorTest extends TestCase {

  private static final Integer ID = 1;
  private static final Integer SUBGRAPH_ID = 3;

  @Mock
  private ResourceTreeService resourceTreeService;

  @InjectMocks
  private PositionCalculator underTest = new AbsolutePositionCalculator();

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void testCalculate() throws Exception {
    Map<Integer, Graph> inputGraphList = new HashMap<Integer, Graph>();
    inputGraphList.put(ID, GrappaGraphFactory.createGraph());

    // underTest.calculate(ID, inputGraphList);

    Graph result = inputGraphList.get(ID);

    GrappaBox boundingBox = (GrappaBox) result.getAttribute("bb").getValue();

    // assertEquals(0.0, boundingBox.getX());
    // assertEquals(0.0, boundingBox.getY());
    // assertEquals(50.0, boundingBox.getWidth());
    // assertEquals(50.0, boundingBox.getHeight());
  }

  @Test
  public void testCalculateRecursive() throws Exception {
    Map<Integer, Graph> inputGraphList = new HashMap<Integer, Graph>();
    inputGraphList.put(ID, GrappaGraphFactory.createGraph());
    inputGraphList.put(SUBGRAPH_ID, GrappaGraphFactory.createGraph());

    List<Integer> childrenNodes = new ArrayList<Integer>();
    childrenNodes.add(SUBGRAPH_ID);
    // when(resourceTreeService.getChildrenNodeIds(eq(ID))).thenReturn(childrenNodes);

    // underTest.calculate(ID, inputGraphList);

    Graph result = inputGraphList.get(SUBGRAPH_ID);

    GrappaBox boundingBox = (GrappaBox) result.getAttribute("bb").getValue();

    // assertEquals(-25.0, boundingBox.getX());
    // assertEquals(25.0, boundingBox.getY());
    // assertEquals(50.0, boundingBox.getWidth());
    // assertEquals(50.0, boundingBox.getHeight());
  }
}
